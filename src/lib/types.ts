export type AllergyCode =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19";

export interface AllergyInfo {
  code: AllergyCode;
  name: string;
  emoji: string;
  keywords: string[];
}

export type MealType = "조식" | "중식" | "석식";

export interface MenuItem {
  name: string;
  allergyCodes: AllergyCode[];
}

export interface Meal {
  date: string;
  mealType: MealType;
  menu: MenuItem[];
  calories: number | null;
  nutrition: {
    carbohydrate?: number;
    protein?: number;
    fat?: number;
    sodium?: number;
  };
  origin: string;
}

export interface MealsResponse {
  date: string;
  meals: Meal[];
}

export interface AllergyMatch {
  code: AllergyCode;
  name: string;
}

export interface CheckedMenuItem extends MenuItem {
  matches: AllergyMatch[];
  isSafe: boolean;
}

export interface SchoolInfo {
  officeCode: string;
  schoolCode: string;
  name: string;
  region: string;
  kind: string;
}

export interface SchoolsResponse {
  schools: SchoolInfo[];
}

export interface SelectedSchool {
  officeCode: string;
  schoolCode: string;
  name: string;
  region: string;
}
