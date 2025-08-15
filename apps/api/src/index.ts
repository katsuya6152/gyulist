import { Hono } from "hono";
import { hc } from "hono/client";
import { createRoutes } from "./routes";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

const routes = createRoutes(app);

// Hono RPC型定義
export type AppType = typeof routes;

// 🎯 共通定数 (値と型の両方をエクスポート)
export * from "./contexts/cattle/domain/constants";
export * from "./contexts/events/domain/constants";
export * from "./contexts/alerts/domain/constants";

// 🔒 型のみエクスポート (Tree Shaking対応)
export type * from "./contexts/cattle/domain/codecs/input";
export type * from "./contexts/cattle/domain/codecs/output";
export type * from "./contexts/events/domain/codecs/input";
export type * from "./contexts/events/domain/codecs/output";
export type * from "./contexts/alerts/domain/codecs/output";
export type * from "./contexts/kpi/domain/codecs/output";
export type * from "./contexts/registration/domain/codecs/input";
export type * from "./contexts/registration/domain/codecs/output";
export type * from "./contexts/auth/domain/codecs/output";

// 🛠️ 必要に応じて個別の型をエクスポート
export type { Bindings } from "./types";

type ClientType = typeof hc<AppType>;

export const createClient = (
	...args: Parameters<ClientType>
): ReturnType<ClientType> => {
	return hc<AppType>(...args);
};

export default app;
