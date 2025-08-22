import { GetAlerts } from "@/services/alertsService";
import { GetCattleList } from "@/services/cattleService";
import { CattleListPresentation } from "./presentational";

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CattleListContainer({ searchParams }: Props) {
	const params = await searchParams;
	const queryParams = {
		cursor: Array.isArray(params.cursor) ? params.cursor[0] : params.cursor,
		limit: Array.isArray(params.limit) ? params.limit[0] : params.limit,
		sort_by: Array.isArray(params.sort_by) ? params.sort_by[0] : params.sort_by,
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

	const cattleList = cattleData.results;
	const alerts = alertsData.results;

	return <CattleListPresentation cattleList={cattleList} alerts={alerts} />;
}
