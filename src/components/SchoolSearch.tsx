"use client";

import { useEffect, useRef, useState } from "react";
import type { SchoolInfo } from "@/lib/types";

interface Snapshot {
  key: string;
  results: SchoolInfo[];
  error: string | null;
}

export function SchoolSearch({
  onSelect,
}: {
  onSelect: (school: SchoolInfo) => void;
}) {
  const [query, setQuery] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot>({
    key: "",
    results: [],
    error: null,
  });
  const reqId = useRef(0);

  const trimmed = query.trim();
  const tooShort = trimmed.length < 2;
  const current = snapshot.key === trimmed;
  const loading = !tooShort && !current;
  const results = tooShort || !current ? [] : snapshot.results;
  const error = tooShort || !current ? null : snapshot.error;
  const touched = !tooShort && current;

  useEffect(() => {
    if (tooShort) return;
    const id = ++reqId.current;
    const timer = setTimeout(() => {
      fetch(`/api/schools?name=${encodeURIComponent(trimmed)}`)
        .then((r) => {
          if (!r.ok) throw new Error("학교 검색에 실패했습니다.");
          return r.json() as Promise<{ schools: SchoolInfo[] }>;
        })
        .then((d) => {
          if (id !== reqId.current) return;
          setSnapshot({ key: trimmed, results: d.schools, error: null });
        })
        .catch((e: unknown) => {
          if (id !== reqId.current) return;
          setSnapshot({
            key: trimmed,
            results: [],
            error: e instanceof Error ? e.message : "알 수 없는 오류",
          });
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [trimmed, tooShort]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="학교 이름을 입력하세요 (예: 광주소프트웨어)"
          className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-base text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/40"
          autoFocus
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {touched && !error && results.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          검색 결과가 없습니다. 정확한 학교명을 입력해 주세요.
        </p>
      )}

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((s) => (
            <li key={`${s.officeCode}-${s.schoolCode}`}>
              <button
                type="button"
                onClick={() => onSelect(s)}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {s.region} · {s.kind}
                  </p>
                </div>
                <span className="ml-3 shrink-0 text-emerald-500">→</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!touched && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            학교 이름 2글자 이상 입력하면 자동으로 검색됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
