import type {
  AllergyCode,
  Meal,
  MealType,
  MenuItem,
  SchoolInfo,
} from "./types";

export function todayYYYYMMDD(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()).replace(/-/g, "");
}

export function formatDateKR(yyyymmdd: string): string {
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export function getWeekdayKR(yyyymmdd: string): string {
  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6)) - 1;
  const d = Number(yyyymmdd.slice(6, 8));
  const names = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return names[new Date(y, m, d).getDay()];
}

export function shiftDate(yyyymmdd: string, deltaDays: number): string {
  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6)) - 1;
  const d = Number(yyyymmdd.slice(6, 8));
  const dt = new Date(y, m, d);
  dt.setDate(dt.getDate() + deltaDays);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, "0");
  const nd = String(dt.getDate()).padStart(2, "0");
  return `${ny}${nm}${nd}`;
}

export function yyyymmddToDash(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

export function dashToYyyymmdd(dash: string): string {
  return dash.replace(/-/g, "");
}

function getApiKey(): string {
  const key = process.env.NEIS_API_KEY ?? "";
  if (!key) {
    throw new Error("NEIS_API_KEY 환경변수가 설정되지 않았습니다.");
  }
  return key;
}

interface NeisMealRow {
  MLSV_YMD: string;
  MMEAL_SC_NM: string;
  DDISH_NM: string;
  CAL_INFO: string;
  NTR_INFO: string;
  ORPLC_INFO: string;
}

interface NeisSchoolRow {
  ATPT_OFCDC_SC_CODE: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  LCTN_SC_NM: string;
  SCHUL_KND_SC_NM: string;
}

function parseNeisMenu(ddishNm: string): MenuItem[] {
  return ddishNm
    .split(/<br\s*\/?>/i)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((entry) => {
      const codeMatch = entry.match(/\(([^)]*)\)\s*$/);
      let allergyCodes: AllergyCode[] = [];
      let name = entry;

      if (codeMatch) {
        name = entry.slice(0, codeMatch.index).trim();
        allergyCodes = codeMatch[1]
          .split(".")
          .map((c) => c.trim())
          .filter((c): c is AllergyCode => /^[1-9]$|^1[0-9]$/.test(c))
          .map((c) => c as AllergyCode);
      }

      return { name, allergyCodes };
    });
}

function mapNeisToMeal(raw: NeisMealRow): Meal {
  const nutritionParts: Record<string, number> = {};
  raw.NTR_INFO.split(/<br\s*\/?>/i).forEach((part) => {
    const [keyRaw, ...valParts] = part.split(":");
    const key = keyRaw.trim();
    const val = valParts.join(":").trim();
    if (!key || !val) return;
    const num = Number(val.replace(/[^0-9.]/g, ""));
    if (Number.isNaN(num)) return;
    if (key.includes("탄수화물")) nutritionParts["탄수화물"] = num;
    else if (key.includes("단백질")) nutritionParts["단백질"] = num;
    else if (key.includes("지방")) nutritionParts["지방"] = num;
    else if (key.includes("나트륨")) nutritionParts["나트륨"] = num;
  });

  const origin = (raw.ORPLC_INFO || "")
    .split(/<br\s*\/?>/i)
    .map((s) => s.trim())
    .filter((s) => s && !/^비고\s*:?\s*$/.test(s))
    .join(" · ");

  return {
    date: raw.MLSV_YMD,
    mealType: raw.MMEAL_SC_NM as MealType,
    menu: parseNeisMenu(raw.DDISH_NM),
    calories: Number(raw.CAL_INFO.replace(/[^0-9.]/g, "")) || null,
    nutrition: {
      carbohydrate: nutritionParts["탄수화물"],
      protein: nutritionParts["단백질"],
      fat: nutritionParts["지방"],
      sodium: nutritionParts["나트륨"],
    },
    origin,
  };
}

export async function fetchMealsFromNeis(
  officeCode: string,
  schoolCode: string,
  yyyymmdd: string,
  apiKey: string,
): Promise<Meal[]> {
  const url =
    `https://open.neis.go.kr/hub/mealServiceDietInfo` +
    `?KEY=${encodeURIComponent(apiKey)}` +
    `&Type=json` +
    `&ATPT_OFCDC_SC_CODE=${encodeURIComponent(officeCode)}` +
    `&SD_SCHUL_CODE=${encodeURIComponent(schoolCode)}` +
    `&MLSV_YMD=${encodeURIComponent(yyyymmdd)}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`NEIS API 요청 실패: ${res.status}`);
  const data = await res.json();

  const rows: NeisMealRow[] | undefined =
    data?.mealServiceDietInfo?.[1]?.row;
  if (!rows || rows.length === 0) return [];

  return rows.map(mapNeisToMeal);
}

export async function getMealsByDate(
  officeCode: string,
  schoolCode: string,
  yyyymmdd?: string,
): Promise<Meal[]> {
  const date = yyyymmdd ?? todayYYYYMMDD();
  return fetchMealsFromNeis(officeCode, schoolCode, date, getApiKey());
}

export async function searchSchools(name: string): Promise<SchoolInfo[]> {
  const trimmed = name.trim();
  if (trimmed.length < 2) return [];

  const apiKey = getApiKey();
  const url =
    `https://open.neis.go.kr/hub/schoolInfo` +
    `?KEY=${encodeURIComponent(apiKey)}` +
    `&Type=json` +
    `&pSize=100` +
    `&SCHUL_NM=${encodeURIComponent(trimmed)}`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`NEIS 학교검색 요청 실패: ${res.status}`);
  const data = await res.json();

  const rows: NeisSchoolRow[] | undefined = data?.schoolInfo?.[1]?.row;
  if (!rows || rows.length === 0) return [];

  return rows.map((r) => ({
    officeCode: r.ATPT_OFCDC_SC_CODE,
    schoolCode: r.SD_SCHUL_CODE,
    name: r.SCHUL_NM,
    region: r.LCTN_SC_NM,
    kind: r.SCHUL_KND_SC_NM,
  }));
}
