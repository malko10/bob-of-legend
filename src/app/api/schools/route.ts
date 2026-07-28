import { searchSchools } from "@/lib/meal-service";
import type { SchoolsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "";

  try {
    const schools = await searchSchools(name);
    const payload: SchoolsResponse = { schools };
    return Response.json(payload);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "학교 검색에 실패했습니다.";
    return Response.json({ error: message }, { status: 500 });
  }
}
