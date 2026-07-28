"use client";

import { useCallback, useEffect, useState } from "react";
import { useAllergies } from "@/hooks/useAllergies";
import {
  formatDateKR,
  getWeekdayKR,
  shiftDate,
  todayYYYYMMDD,
} from "@/lib/meal-service";
import type { MealsResponse, SelectedSchool } from "@/lib/types";
import { AlertBanner } from "./AlertBanner";
import { CalendarPopover } from "./CalendarPopover";
import { MealCard } from "./MealCard";

interface Snapshot {
  key: string;
  data: MealsResponse | null;
  error: string | null;
}

export function MealBoard({ school }: { school: SelectedSchool }) {
  const { allergies, hydrated } = useAllergies();
  const [date, setDate] = useState<string>(todayYYYYMMDD());
  const [refreshKey, setRefreshKey] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot>({
    key: "",
    data: null,
    error: null,
  });

  const requestKey = `${school.officeCode}:${school.schoolCode}:${date}:${refreshKey}`;
  const loading = snapshot.key !== requestKey;
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const isToday = date === todayYYYYMMDD();

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      office: school.officeCode,
      school: school.schoolCode,
      date,
    });
    fetch(`/api/meals?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error("급식 정보를 불러오지 못했습니다.");
        return r.json() as Promise<MealsResponse>;
      })
      .then((d) => {
        if (active) setSnapshot({ key: requestKey, data: d, error: null });
      })
      .catch((e: unknown) => {
        if (active)
          setSnapshot({
            key: requestKey,
            data: null,
            error: e instanceof Error ? e.message : "알 수 없는 오류",
          });
      });
    return () => {
      active = false;
    };
  }, [requestKey, school.officeCode, school.schoolCode, date]);

  useEffect(() => {
    const timer = setInterval(() => setRefreshKey((k) => k + 1), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const error = snapshot.error;
  const data = snapshot.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDate((d) => shiftDate(d, -1))}
            aria-label="이전 날짜"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <span aria-hidden>📅</span>
            <span className="whitespace-nowrap">
              {formatDateKR(date)} {getWeekdayKR(date)}
            </span>
          </button>

          <button
            onClick={() => setDate((d) => shiftDate(d, 1))}
            aria-label="다음 날짜"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            →
          </button>

          {!isToday && (
            <button
              onClick={() => setDate(todayYYYYMMDD())}
              className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              오늘
            </button>
          )}
        </div>
        <button
          onClick={refresh}
          className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          새로고침
        </button>
      </div>

      {calendarOpen && (
        <CalendarPopover
          value={date}
          onChange={setDate}
          onClose={() => setCalendarOpen(false)}
        />
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : error || !data ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl mb-2">😓</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {error ?? "급식 정보가 없습니다."}
          </p>
          <button
            onClick={refresh}
            className="mt-4 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
          >
            다시 불러오기
          </button>
        </div>
      ) : data.meals.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl mb-2">🍽️</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            이 날은 급식이 없는 날입니다.
          </p>
        </div>
      ) : (
        <>
          {hydrated && <AlertBanner meals={data.meals} allergies={allergies} />}
          <div className="grid gap-4 md:grid-cols-3">
            {data.meals.map((meal) => (
              <MealCard
                key={meal.mealType}
                meal={meal}
                allergies={hydrated ? allergies : []}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
