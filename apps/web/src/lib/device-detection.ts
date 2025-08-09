/**
 * デバイス検出のためのユーティリティ関数
 */

export interface DeviceInfo {
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
	isIOS: boolean;
	isAndroid: boolean;
	isChrome: boolean;
	isSafari: boolean;
	isFirefox: boolean;
	screenWidth: number;
	screenHeight: number;
}

/**
 * ユーザーエージェントからデバイス情報を取得
 */
export function getDeviceInfo(): DeviceInfo {
	if (typeof window === "undefined") {
		// サーバーサイドの場合はデフォルト値を返す
		return {
			isMobile: false,
			isTablet: false,
			isDesktop: true,
			isIOS: false,
			isAndroid: false,
			isChrome: false,
			isSafari: false,
			isFirefox: false,
			screenWidth: 1920,
			screenHeight: 1080,
		};
	}

	const userAgent = window.navigator.userAgent;
	const screenWidth = window.screen.width;
	const screenHeight = window.screen.height;

	// モバイルデバイス検出（より詳細な検出）
	const mobileRegex =
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS/i;
	const isMobile = mobileRegex.test(userAgent);

	// タブレット検出（iPadなど）
	const tabletRegex = /iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk/i;
	const isTablet = tabletRegex.test(userAgent);

	// デスクトップ検出
	const isDesktop = !isMobile && !isTablet;

	// OS検出
	const isIOS = /iPad|iPhone|iPod/.test(userAgent);
	const isAndroid = /Android/.test(userAgent);

	// ブラウザ検出
	const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
	const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
	const isFirefox = /Firefox/.test(userAgent);

	return {
		isMobile,
		isTablet,
		isDesktop,
		isIOS,
		isAndroid,
		isChrome,
		isSafari,
		isFirefox,
		screenWidth,
		screenHeight,
	};
}

/**
 * 画面サイズからデバイスタイプを判定
 */
export function getDeviceTypeByScreenSize(): "mobile" | "tablet" | "desktop" {
	if (typeof window === "undefined") return "desktop";

	const width = window.innerWidth;

	if (width < 768) return "mobile";
	if (width < 1024) return "tablet";
	return "desktop";
}

/**
 * PCデバイスかどうかを判定（より厳密な判定）
 */
export function isPCDevice(): boolean {
	const deviceInfo = getDeviceInfo();
	const deviceType = getDeviceTypeByScreenSize();

	// デスクトップまたはタブレットサイズ以上の場合をPCとして扱う
	// ただし、モバイルデバイスでタブレットサイズの場合は除外
	if (deviceInfo.isMobile && deviceType === "tablet") {
		return false;
	}

	return (
		deviceInfo.isDesktop ||
		deviceType === "desktop" ||
		(deviceType === "tablet" && !deviceInfo.isMobile)
	);
}

/**
 * モバイルデバイスかどうかを判定
 */
export function isMobileDevice(): boolean {
	const deviceInfo = getDeviceInfo();
	const deviceType = getDeviceTypeByScreenSize();

	return deviceInfo.isMobile || deviceType === "mobile";
}
