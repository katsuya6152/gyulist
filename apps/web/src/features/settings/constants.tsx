// テーマの選択肢
export const THEME_OPTIONS = [
	{ value: "light", label: "ライトモード", icon: "Sun" },
	{ value: "dark", label: "ダークモード", icon: "Moon" },
	{ value: "system", label: "システム設定に従う", icon: "Monitor" }
] as const;

// テーマの型
export type ThemeOption = (typeof THEME_OPTIONS)[number]["value"];
