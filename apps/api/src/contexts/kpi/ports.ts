import type { Result } from "../../shared/result";

/**
 * 生イベントデータ。
 * データベースから取得される生のイベントデータを表現します。
 */
export type RawEvent = {
	/** 牛ID */ cattleId: number;
	/** イベントタイプ */ eventType: string;
	/** イベント日時（ISO8601） */ eventDatetime: string;
};

/**
 * トレンドポイント。
 * 月次でのKPI指標を表現します。
 */
export type TrendPoint = {
	/** 月（YYYY-MM形式） */ month: string;
	/** KPI指標 */ metrics: {
		/** 受胎率（%） */ conceptionRate: number | null;
		/** 平均空胎日数 */ avgDaysOpen: number | null;
		/** 平均分娩間隔 */ avgCalvingInterval: number | null;
		/** 受胎あたりの授精回数 */ aiPerConception: number | null;
	};
	/** イベント別件数 */ counts: Record<string, number>;
};

/**
 * トレンド差分。
 * 前月比でのKPI指標の変化を表現します。
 */
export type TrendDelta = {
	/** 月（YYYY-MM形式） */ month: string;
	/** KPI指標差分 */ metrics: {
		/** 受胎率差分（%） */ conceptionRate: number | null;
		/** 平均空胎日数差分 */ avgDaysOpen: number | null;
		/** 平均分娩間隔差分 */ avgCalvingInterval: number | null;
		/** 受胎あたりの授精回数差分 */ aiPerConception: number | null;
	};
};

/**
 * KPIリポジトリポート。
 *
 * KPI指標の計算に必要なデータの取得、トレンド分析を提供します。
 * 繁殖指標、生産性指標などの分析に使用されます。
 */
export interface KpiRepoPort {
	/**
	 * 繁殖KPI計算用のイベントデータを取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param fromIso - 開始日時（ISO8601、オプション）
	 * @param toIso - 終了日時（ISO8601、オプション）
	 * @returns イベントデータ一覧
	 */
	findEventsForBreedingKpi(
		ownerUserId: number,
		fromIso?: string,
		toIso?: string
	): Promise<RawEvent[]>;

	/**
	 * 繁殖KPIトレンドを取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param params - トレンド分析パラメータ
	 * @returns トレンド系列と差分データ
	 */
	getBreedingKpiTrends(
		ownerUserId: number,
		params: {
			/** 終了月（YYYY-MM形式、オプション） */ toMonth?: string;
			/** 分析月数（オプション） */ months?: number;
			/** 開始月（YYYY-MM形式、オプション） */ fromMonth?: string;
		}
	): Promise<{ series: TrendPoint[]; deltas: TrendDelta[] }>;
}
