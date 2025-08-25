import { Hono } from "hono";
import { hc } from "hono/client";
import { createRoutes } from "./interfaces/http/routes";
import { getLogger } from "./shared/logging/logger";
import type { Env } from "./shared/ports/d1Database";

const app = new Hono<{ Bindings: Env }>();

// ルートの作成（データベースは実行時にコンテキストから取得）
const routes = createRoutes(app);

// Hono RPC型定義
export type AppType = typeof routes;

// 🔒 新アーキテクチャの型エクスポート
export * from "./domain/types/cattle";
export * from "./domain/types/events";
export * from "./domain/types/alerts";
export * from "./domain/types/kpi";
export * from "./domain/types/auth";
export * from "./domain/types/registration";

// 🛠️ 必要に応じて個別の型をエクスポート
export type { Env } from "./shared/ports/d1Database";

// 📋 Webアプリが必要とする定数のエクスポート
export {
	GENDERS,
	GROWTH_STAGES,
	STATUSES
} from "./domain/types/cattle/CattleTypes";

// 性別のラベル（Webアプリ用）
export const GENDER_LABELS: Record<string, string> = {
	雄: "雄",
	去勢: "去勢",
	雌: "雌"
};

export {
	EVENT_TYPES,
	EVENT_TYPE_LABELS,
	EVENT_GROUP_LABELS,
	EVENT_TYPE_GROUPS,
	EVENT_PRIORITIES,
	EVENT_GROUP_ORDER
} from "./domain/types/events/EventTypes";

// アラート関連の定数（Webアプリ用）
export {
	ALERT_SEVERITY_LABELS,
	ALERT_STATUS_LABELS,
	ALERT_TYPE_LABELS,
	STATUS_UPDATE_MESSAGES
} from "./domain/types/alerts/AlertTypes";

// 成長段階のラベル（Webアプリ用）
export const GROWTH_STAGE_LABELS: Record<string, string> = {
	CALF: "繁殖・哺乳期",
	GROWING: "育成期",
	FATTENING: "肥育期",
	FIRST_CALVED: "初産牛",
	MULTI_PAROUS: "経産牛"
};

// 成長段階のタプル（Zodスキーマ用）
export const GROWTH_STAGES_TUPLE = [
	"CALF",
	"GROWING",
	"FATTENING",
	"FIRST_CALVED",
	"MULTI_PAROUS"
] as const;

// ステータスのラベル（Webアプリ用）
export const STATUS_LABELS: Record<string, string> = {
	HEALTHY: "健康",
	PREGNANT: "妊娠中",
	RESTING: "休養中",
	TREATING: "治療中",
	SCHEDULED_FOR_SHIPMENT: "出荷予定",
	SHIPPED: "出荷済み",
	DEAD: "死亡"
};

type ClientType = typeof hc<AppType>;

export const createClient = (
	...args: Parameters<ClientType>
): ReturnType<ClientType> => {
	return hc<AppType>(...args);
};

export default {
	fetch: app.fetch
};
