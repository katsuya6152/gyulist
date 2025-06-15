import { GetCattleList } from "@/services/cattleService";
import { CattleListPresentation } from "./presentational";

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CattleListContainer({ searchParams }: Props) {
	const params = await searchParams;
	const data = await GetCattleList({
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
	});
	const cattleList = data.results;

	return <CattleListPresentation cattleList={cattleList} />;
}
