import { GetCattleList } from "@/services/cattleService";
import { CattleListPresentation } from "./presentational";

type Props = {
	searchParams: {
		cursor?: string;
		limit?: string;
		sort_by?: string;
		sort_order?: string;
		search?: string;
		growth_stage?: string;
		gender?: string;
	};
};

export default async function CattleListContainer({ searchParams }: Props) {
	const data = await GetCattleList({
		cursor: searchParams.cursor,
		limit: searchParams.limit,
		sort_by: searchParams.sort_by,
		sort_order: searchParams.sort_order,
		search: searchParams.search,
		growth_stage: searchParams.growth_stage,
		gender: searchParams.gender,
	});
	const cattleList = data.results;

	return <CattleListPresentation cattleList={cattleList} />;
}
