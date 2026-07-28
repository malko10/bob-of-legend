"use client";

import { useState } from "react";
import { useAllergies } from "@/hooks/useAllergies";
import { useSchool } from "@/hooks/useSchool";
import type { SchoolInfo } from "@/lib/types";
import { AllergySelector } from "./AllergySelector";
import { MealBoard } from "./MealBoard";
import { SchoolSearch } from "./SchoolSearch";

type Step = "school" | "allergies" | "meal";

const STEP_LABEL: Record<Step, string> = {
  school: "학교 선택",
  allergies: "알레르기 설정",
  meal: "오늘의 급식",
};

export function OnboardingFlow() {
  const { school, select, hydrated } = useSchool();
  const { allergies } = useAllergies();
  const [overrideStep, setOverrideStep] = useState<Step | null>(null);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <div className="h-10 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-14 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-14 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-14 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      </div>
    );
  }

  const baseStep: Step = school ? "meal" : "school";
  const step: Step = overrideStep ?? baseStep;

  const handleSelectSchool = (s: SchoolInfo) => {
    select({
      officeCode: s.officeCode,
      schoolCode: s.schoolCode,
      name: s.name,
      region: s.region,
    });
    setOverrideStep("allergies");
  };

  const goTo = (s: Step) => setOverrideStep(s);

  return (
    <div className="mx-auto max-w-3xl">
      <StepIndicator step={step} />

      {step === "school" && (
        <section className="space-y-5">
          <header>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {school ? "학교 변경" : "환영해요!"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              재학 중인 학교를 검색해서 선택하세요.
            </p>
          </header>
          <SchoolSearch onSelect={handleSelectSchool} />
          {school && (
            <button
              onClick={() => goTo("meal")}
              className="text-sm font-medium text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              ← 이전 학교로 돌아가기 ({school.name})
            </button>
          )}
        </section>
      )}

      {step === "allergies" && (
        <section className="space-y-6">
          <header>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              알레르기 설정
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              해당하는 알레르기를 모두 골라주세요. 선택한 성분이 든 메뉴를 빨간색으로 표시해 드려요.
            </p>
          </header>
          <AllergySelector />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => goTo("meal")}
              className="flex-1 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              {allergies.length > 0
                ? "급식 확인하기"
                : "알레르기 없이 시작하기"}
            </button>
            <button
              onClick={() => goTo("school")}
              className="rounded-2xl border border-zinc-200 px-6 py-3.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              이전
            </button>
          </div>
        </section>
      )}

      {step === "meal" && school && (
        <section className="space-y-5">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {school.name}
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {school.region}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goTo("school")}
                className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                학교 변경
              </button>
              <button
                onClick={() => goTo("allergies")}
                className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                알레르기 변경
              </button>
            </div>
          </header>
          <MealBoard school={school} />
        </section>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ["school", "allergies", "meal"];
  const currentIndex = steps.indexOf(step);

  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                active
                  ? "bg-emerald-600 text-white"
                  : done
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500",
              ].join(" ")}
            >
              {done ? "✓" : i + 1}
            </div>
            <span
              className={[
                "hidden text-xs font-medium sm:inline",
                active
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 dark:text-zinc-500",
              ].join(" ")}
            >
              {STEP_LABEL[s]}
            </span>
            {i < steps.length - 1 && (
              <div
                className={[
                  "mx-1 h-px w-6 sm:w-10",
                  done ? "bg-emerald-300 dark:bg-emerald-700" : "bg-zinc-200 dark:bg-zinc-700",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
