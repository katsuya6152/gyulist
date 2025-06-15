import CattleListContainer from "@/features/cattle/list/container";

export const runtime = "edge";

type Props = {
	searchParams?: {
		cursor?: string;
		limit?: string;
		sort_by?: string;
		sort_order?: string;
		search?: string;
		growth_stage?: string;
		gender?: string;
	};
};

export default async function CattlePage({ searchParams = {} }: Props) {
	return <CattleListContainer searchParams={searchParams} />;
}
