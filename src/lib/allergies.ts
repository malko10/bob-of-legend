import type { AllergyInfo, AllergyCode } from "./types";

export const ALLERGIES: readonly AllergyInfo[] = [
  { code: "1", name: "난류", emoji: "🥚", keywords: ["난류", "계란", "달걀", "메추리알", "지단", "수란", "프라이"] },
  { code: "2", name: "우유", emoji: "🥛", keywords: ["우유", "우유유", "밀크", "치즈", "버터", "요거트", "요구르트", "생크림", "연유"] },
  { code: "3", name: "메밀", emoji: "🌾", keywords: ["메밀", "메밀가루"] },
  { code: "4", name: "땅콩", emoji: "🥜", keywords: ["땅콩", "피넛", "피넛버터"] },
  { code: "5", name: "대두", emoji: "🫘", keywords: ["대두", "콩", "두부", "간장", "된장", "고추장", "청국장", "콩나물", "두유", "대두단백"] },
  { code: "6", name: "밀", emoji: "🍞", keywords: ["밀", "밀가루", "빵", "면", "국수", "파스타", "스파게티", "만두", "부침가루", "튀김가루", "핫도그"] },
  { code: "7", name: "고등어", emoji: "🐟", keywords: ["고등어"] },
  { code: "8", name: "게", emoji: "🦀", keywords: ["게", "꽃게", "대게", "킹크랩", "크랩"] },
  { code: "9", name: "새우", emoji: "🦐", keywords: ["새우", "대하", "깐새우", "새우젓"] },
  { code: "10", name: "돼지고기", emoji: "🍖", keywords: ["돼지고기", "돈까스", "돈육", "햄", "베이컨", "소시지", "삼겹살", "제육"] },
  { code: "11", name: "복숭아", emoji: "🍑", keywords: ["복숭아", "복숭아과"] },
  { code: "12", name: "토마토", emoji: "🍅", keywords: ["토마토", "케첩", "토마토소스"] },
  { code: "13", name: "아황산염", emoji: "🍇", keywords: ["아황산", "건포도", "아황산염"] },
  { code: "14", name: "호두", emoji: "🌰", keywords: ["호두", "왈넛"] },
  { code: "15", name: "닭고기", emoji: "🍗", keywords: ["닭고기", "닭", "치킨", "윙", "닭가슴살"] },
  { code: "16", name: "쇠고기", emoji: "🥩", keywords: ["쇠고기", "소고기", "우육", "불고기"] },
  { code: "17", name: "오징어", emoji: "🦑", keywords: ["오징어"] },
  { code: "18", name: "조개류", emoji: "🐚", keywords: ["조개", "바지락", "전복", "굴", "홍합", "가리비", "개조개", "피조개", "참소라"] },
  { code: "19", name: "잣", emoji: "🌳", keywords: ["잣"] },
] as const;

export const ALLERGY_MAP: Record<AllergyCode, AllergyInfo> = ALLERGIES.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<AllergyCode, AllergyInfo>,
);

export function getAllergyInfo(code: AllergyCode): AllergyInfo {
  return ALLERGY_MAP[code];
}
