// Google Analytics 4 カスタムイベント送信用ユーティリティ
import { sendGAEvent } from "@next/third-parties/google";

// よく使うイベントの定義
export const trackDemoStart = () => {
	sendGAEvent("event", "demo_start", {
		event_category: "engagement",
		event_label: "デモ体験開始"
	});
};

export const trackWaitlistSignup = () => {
	sendGAEvent("event", "waitlist_signup", {
		event_category: "conversion",
		event_label: "事前登録完了"
	});
};

export const trackFeatureClick = (featureName: string) => {
	sendGAEvent("event", "feature_click", {
		event_category: "engagement",
		event_label: featureName
	});
};

export const trackPageView = (pageName: string) => {
	sendGAEvent("event", "page_view", {
		page_title: pageName,
		page_location: window.location.href
	});
};
