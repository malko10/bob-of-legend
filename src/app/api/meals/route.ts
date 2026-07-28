import { getMealsByDate } from "@/lib/meal-service";
import type { MealsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const office = searchParams.get("office");
  const school = searchParams.get("school");
  const date = searchParams.get("date") ?? undefined;

  if (!office || !school) {
    return Response.json(
      { error: "학교 정보(office, school)가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const meals = await getMealsByDate(office, school, date);
    const payload: MealsResponse = {
      date: meals[0]?.date ?? date ?? "",
      meals,
    };
    return Response.json(payload);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "급식 정보를 불러오지 못했습니다.";
    return Response.json({ error: message }, { status: 500 });
  }
}
