"use client";

import { GoogleAnalytics } from "@next/third-parties/google";

// Google Analytics設定
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// CVイベント追跡
export const trackEvent = (
	eventName: string,
	parameters?: Record<string, any>
) => {
	if (typeof window !== "undefined" && window.gtag) {
		window.gtag("event", eventName, {
			...parameters
		});
	}
};

// LINE登録CVイベント
export const trackLineRegistration = () => {
	trackEvent("line_registration", {
		event_category: "conversion",
		event_label: "LINE登録",
		value: 1
	});
};

// Gyulist遷移CVイベント
export const trackGyulistTransition = (source?: string) => {
	trackEvent("gyulist_transition", {
		event_category: "conversion",
		event_label: "Gyulist遷移",
		source: source || "unknown",
		value: 1
	});
};

// 記事閲覧イベント
export const trackArticleView = (articleTitle: string, category: string) => {
	trackEvent("article_view", {
		event_category: "engagement",
		event_label: articleTitle,
		article_category: category
	});
};

// シェアイベント
export const trackShare = (platform: string, articleTitle: string) => {
	trackEvent("share", {
		event_category: "engagement",
		event_label: articleTitle,
		method: platform
	});
};

// 検索イベント
export const trackSearch = (searchTerm: string) => {
	trackEvent("search", {
		event_category: "engagement",
		search_term: searchTerm
	});
};

// Google Analytics コンポーネント
export function Analytics() {
	if (!GA_MEASUREMENT_ID) return null;

	return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
