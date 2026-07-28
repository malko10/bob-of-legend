import { OnboardingFlow } from "@/components/OnboardingFlow";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl" aria-hidden>🍱</span>
            <div>
              <h1 className="text-xl font-extrabold leading-tight tracking-tight">
                Bob of Legend
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                스마트 급식 알레르기 체크
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        <OnboardingFlow />
      </main>

      <footer className="mx-auto max-w-3xl px-5 py-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
        <p>
          매일 실시간 학교 급식 정보 제공 · 알레르기 정보는 참고용이며 정확한 여부는 학교 급식소에 확인하세요.
        </p>
      </footer>
    </div>
  );
}
