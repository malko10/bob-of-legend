import { ALLERGIES, getAllergyInfo } from "./allergies";
import type {
  AllergyCode,
  AllergyMatch,
  CheckedMenuItem,
  MenuItem,
} from "./types";

export function detectAllergiesByName(menuName: string): AllergyMatch[] {
  const matches: AllergyMatch[] = [];
  const seen = new Set<AllergyCode>();

  for (const allergy of ALLERGIES) {
    if (seen.has(allergy.code)) continue;
    const hit = allergy.keywords.some((kw) => menuName.includes(kw));
    if (hit) {
      matches.push({ code: allergy.code, name: allergy.name });
      seen.add(allergy.code);
    }
  }

  return matches;
}

export function checkMenuItem(
  item: MenuItem,
  userAllergies: AllergyCode[],
): CheckedMenuItem {
  const userSet = new Set(userAllergies);
  const matches: AllergyMatch[] = [];
  const seen = new Set<AllergyCode>();

  for (const code of item.allergyCodes) {
    if (userSet.has(code) && !seen.has(code)) {
      matches.push({ code, name: getAllergyInfo(code).name });
      seen.add(code);
    }
  }

  for (const { code, name } of detectAllergiesByName(item.name)) {
    if (userSet.has(code) && !seen.has(code)) {
      matches.push({ code, name });
      seen.add(code);
    }
  }

  return { ...item, matches, isSafe: matches.length === 0 };
}

export function checkMenu(
  menu: MenuItem[],
  userAllergies: AllergyCode[],
): CheckedMenuItem[] {
  return menu.map((item) => checkMenuItem(item, userAllergies));
}

export function hasAnyAllergen(
  menu: MenuItem[],
  userAllergies: AllergyCode[],
): boolean {
  return checkMenu(menu, userAllergies).some((item) => !item.isSafe);
}

export function summarizeAllergens(
  menu: MenuItem[],
  userAllergies: AllergyCode[],
): AllergyMatch[] {
  const checked = checkMenu(menu, userAllergies);
  const seen = new Set<AllergyCode>();
  const summary: AllergyMatch[] = [];

  for (const item of checked) {
    for (const m of item.matches) {
      if (!seen.has(m.code)) {
        summary.push(m);
        seen.add(m.code);
      }
    }
  }

  return summary;
}
