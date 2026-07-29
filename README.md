# Bob of Legend · 스마트 급식 알레르기 체크

모든 학교 학생이 이용할 수 있는 급식 알레르기 체크 서비스입니다.
학교를 검색하고 알레르기를 설정하면, 오늘 급식에서 알레르기 유발 메뉴를 한눈에 확인할 수 있습니다.

## 실행 (로컬)

```bash
npm run dev
```

`.env.local`에 NEIS 인증키만 있으면 됩니다:

```env
NEIS_API_KEY=공공데이터포털에서발급받은인증키
```
링크
https://bob-of-legend.vercel.app/

## 사용 흐름

1. **학교 선택** — 학교 이름 검색(2글자 이상) → 자동 검색 → 선택
2. **알레르기 설정** — 해당하는 알레르기 성분 선택 (없으면 건너뛰기)
3. **오늘의 급식** — 급식표에서 유발 메뉴가 빨간색으로 강조 + 상단 경고 배너

학교·알레르기 정보는 브라우저에 저장되어, 다음 방문 시 바로 급식 화면으로 이동합니다.
(상단 버튼으로 언제든 학교·알레르기 변경 가능)

## 실시간 급식

- 서버에서 한국 시간(Asia/Seoul) 기준 오늘 날짜의 급식을 NEIS에서 조회
- 1시간 단위 서버 캐시 + 클라이언트 5분 자동 새로고침
- 날이 바뀌면 자동으로 다음 날 급식 표시

## 구조

- `src/lib/types.ts` — 데이터 모델 (알레르기, 메뉴, 급식, 학교)
- `src/lib/allergies.ts` — 한국 학교급식 표준 알레르기 19종 정의 + 키워드 매핑
- `src/lib/match.ts` — 알레르기 매칭 로직 (번호 매칭 + 메뉴명 키워드 보조 매칭)
- `src/lib/meal-service.ts` — NEIS API 연동 (학교 검색 `schoolInfo` + 급식 조회 `mealServiceDietInfo`)
- `src/app/api/schools/route.ts` — `GET /api/schools?name=학교명` 학교 검색
- `src/app/api/meals/route.ts` — `GET /api/meals?office=F10&school=7140392` 급식 조회
- `src/hooks/useAllergies.ts` — 알레르기 정보 localStorage 훅
- `src/hooks/useSchool.ts` — 선택 학교 localStorage 훅
- `src/components/OnboardingFlow.tsx` — 3단계 흐름(학교→알레르기→급식) 관리
- `src/components/SchoolSearch.tsx` — 학교 검색/선택
- `src/components/AllergySelector.tsx` — 알레르기 칩 선택
- `src/components/MealBoard.tsx` — 급식표 + 자동 새로고침
- `src/components/MealCard.tsx` / `MenuItemRow.tsx` — 급식 카드 + 알레르기 강조
- `src/components/AlertBanner.tsx` — 유발 성분 감지 경고 배너

## 배포 (Vercel)

- 환경변수 `NEIS_API_KEY` 설정 (학교별 office/school 코드는 사용자가 선택하므로 불필요)
- `vercel.json`에 `"regions": ["icn1"]` (서울) 설정 — NEIS API가 해외 IP를 차단하므로 한국 리전 필수

## NEIS 인증키 발급

https://www.data.go.kr/data/15015470/openapi.do (교육정보개방표준API > 급식식단정보)에서 활용신청 후 인증키 발급.

## 알레르기 번호표 (표준 19종)

| 번호 | 성분 | 번호 | 성분 | 번호 | 성분 |
|------|------|------|------|------|------|
| 1 | 난류 | 7 | 고등어 | 13 | 아황산염 |
| 2 | 우유 | 8 | 게 | 14 | 호두 |
| 3 | 메밀 | 9 | 새우 | 15 | 닭고기 |
| 4 | 땅콩 | 10 | 돼지고기 | 16 | 쇠고기 |
| 5 | 대두 | 11 | 복숭아 | 17 | 오징어 |
| 6 | 밀 | 12 | 토마토 | 18 | 조개류 |
| | | | | 19 | 잣 |
