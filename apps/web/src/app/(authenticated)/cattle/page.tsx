import CattleListContainer from "@/features/cattle/list/container";

export const runtime = "edge";

export default async function CattlePage() {
	return <CattleListContainer />;
}
