/**
 * Feature Flag System
 *
 * 段階的移行のためのフィーチャーフラグ管理
 */

/**
 * 利用可能なフィーチャーフラグ
 */
export type FeatureFlags = {
	// アーキテクチャ移行関連
	useNewCattleArchitecture: boolean;
	useNewEventsArchitecture: boolean;
	useNewAlertsArchitecture: boolean;
	useNewKpiArchitecture: boolean;
	useNewAuthArchitecture: boolean;
	useNewRegistrationArchitecture: boolean;
	useNewBreedingArchitecture: boolean;

	// 新機能フラグ（将来拡張用）
	enableAdvancedFiltering: boolean;
	enableRealtimeUpdates: boolean;
	enableBatchOperations: boolean;
};

/**
 * デフォルトのフィーチャーフラグ設定
 */
const DEFAULT_FLAGS: FeatureFlags = {
	// 段階的移行 - Phase 4: 本格運用切り替え完了！
	useNewCattleArchitecture: true, // ✅ Cattle domain activated!
	useNewEventsArchitecture: true, // ✅ Events domain activated!
	useNewAlertsArchitecture: true, // ✅ Alerts domain activated!
	useNewKpiArchitecture: true, // ✅ KPI domain activated!
	useNewAuthArchitecture: true, // ✅ Auth domain activated!
	useNewRegistrationArchitecture: true, // 🚀 Registration domain activated!
	useNewBreedingArchitecture: true, // ✅ Breeding domain activated! (integrated with Cattle)

	// 新機能 - 開発中は false
	enableAdvancedFiltering: false,
	enableRealtimeUpdates: false,
	enableBatchOperations: false
};

/**
 * 環境変数からフィーチャーフラグを読み込み
 */
function loadFlagsFromEnv(): Partial<FeatureFlags> {
	const flags: Partial<FeatureFlags> = {};

	// 環境変数から boolean 値を安全に読み込み
	const getBooleanEnv = (key: string): boolean | undefined => {
		const value = process.env[key];
		if (value === undefined) return undefined;
		return value.toLowerCase() === "true";
	};

	// アーキテクチャ移行フラグ
	const newCattleArch = getBooleanEnv("USE_NEW_CATTLE_ARCHITECTURE");
	if (newCattleArch !== undefined)
		flags.useNewCattleArchitecture = newCattleArch;

	const newEventsArch = getBooleanEnv("USE_NEW_EVENTS_ARCHITECTURE");
	if (newEventsArch !== undefined)
		flags.useNewEventsArchitecture = newEventsArch;

	const newAlertsArch = getBooleanEnv("USE_NEW_ALERTS_ARCHITECTURE");
	if (newAlertsArch !== undefined)
		flags.useNewAlertsArchitecture = newAlertsArch;

	const newKpiArch = getBooleanEnv("USE_NEW_KPI_ARCHITECTURE");
	if (newKpiArch !== undefined) flags.useNewKpiArchitecture = newKpiArch;

	const newAuthArch = getBooleanEnv("USE_NEW_AUTH_ARCHITECTURE");
	if (newAuthArch !== undefined) flags.useNewAuthArchitecture = newAuthArch;

	const newRegistrationArch = getBooleanEnv(
		"USE_NEW_REGISTRATION_ARCHITECTURE"
	);
	if (newRegistrationArch !== undefined)
		flags.useNewRegistrationArchitecture = newRegistrationArch;

	const newBreedingArch = getBooleanEnv("USE_NEW_BREEDING_ARCHITECTURE");
	if (newBreedingArch !== undefined)
		flags.useNewBreedingArchitecture = newBreedingArch;

	// 新機能フラグ
	const advancedFiltering = getBooleanEnv("ENABLE_ADVANCED_FILTERING");
	if (advancedFiltering !== undefined)
		flags.enableAdvancedFiltering = advancedFiltering;

	const realtimeUpdates = getBooleanEnv("ENABLE_REALTIME_UPDATES");
	if (realtimeUpdates !== undefined)
		flags.enableRealtimeUpdates = realtimeUpdates;

	const batchOperations = getBooleanEnv("ENABLE_BATCH_OPERATIONS");
	if (batchOperations !== undefined)
		flags.enableBatchOperations = batchOperations;

	return flags;
}

/**
 * フィーチャーフラグの設定を取得
 */
export function getFeatureFlags(): FeatureFlags {
	const envFlags = loadFlagsFromEnv();
	return {
		...DEFAULT_FLAGS,
		...envFlags
	};
}

/**
 * 特定のフィーチャーフラグが有効かどうかを確認
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
	const flags = getFeatureFlags();
	return flags[flag];
}

/**
 * 特定のフィーチャーフラグの値を取得
 */
export function getFeatureFlag(flag: keyof FeatureFlags): boolean {
	const flags = getFeatureFlags();
	return flags[flag];
}

/**
 * 開発環境でのフィーチャーフラグの動的設定（テスト用）
 */
let testFlags: Partial<FeatureFlags> | null = null;

export function setTestFeatureFlags(flags: Partial<FeatureFlags>): void {
	if (process.env.NODE_ENV !== "test") {
		console.warn("setTestFeatureFlags should only be used in test environment");
		return;
	}
	testFlags = flags;
}

export function clearTestFeatureFlags(): void {
	testFlags = null;
}

export function getTestFeatureFlags(): FeatureFlags {
	const baseFlags = getFeatureFlags();
	if (testFlags) {
		return { ...baseFlags, ...testFlags };
	}
	return baseFlags;
}

/**
 * フィーチャーフラグの状態をログ出力（デバッグ用）
 */
export function logFeatureFlags(): void {
	const flags = getFeatureFlags();
	console.log("🚩 Feature Flags:", JSON.stringify(flags, null, 2));
}
