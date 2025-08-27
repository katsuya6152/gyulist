import { GetAlerts } from "@/services/alertsService";
import { GetCattleList } from "@/services/cattleService";
import { CattleListPresentation } from "./presentational";

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CattleListContainer({ searchParams }: Props) {
	try {
		const params = await searchParams;
		const queryParams = {
			cursor: Array.isArray(params.cursor) ? params.cursor[0] : params.cursor,
			limit: Array.isArray(params.limit) ? params.limit[0] : params.limit,
			sort_by: Array.isArray(params.sort_by)
				? params.sort_by[0]
				: params.sort_by,
			sort_order: Array.isArray(params.sort_order)
				? params.sort_order[0]
				: params.sort_order,
			search: Array.isArray(params.search) ? params.search[0] : params.search,
			growth_stage: Array.isArray(params.growth_stage)
				? params.growth_stage[0]
				: params.growth_stage,
			gender: Array.isArray(params.gender) ? params.gender[0] : params.gender,
			status: Array.isArray(params.status) ? params.status[0] : params.status,
			has_alert: Array.isArray(params.has_alert)
				? params.has_alert[0]
				: params.has_alert
		};

		// 牛一覧とアラート情報を並行取得
		const [cattleData, alertsData] = await Promise.all([
			GetCattleList(queryParams),
			GetAlerts()
		]);

		const cattleList = cattleData?.results || [];
		const alerts = alertsData?.results || [];

		return (
			<CattleListPresentation
				cattleList={cattleList}
				alerts={alerts}
				sortBy={queryParams.sort_by}
				sortOrder={queryParams.sort_order}
			/>
		);
	} catch (error) {
		console.error("Error in CattleListContainer:", error);
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<h1 className="text-2xl font-bold text-red-600 mb-4">
					エラーが発生しました
				</h1>
				<p className="text-gray-600 mb-4">
					牛一覧の取得中に問題が発生しました。
				</p>
				<pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-w-full">
					{error instanceof Error ? error.message : String(error)}
				</pre>
			</div>
		);
	}
}
