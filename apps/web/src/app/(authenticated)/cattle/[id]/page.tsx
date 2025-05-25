import CattleDetailContainer from "@/features/cattle/detail/container";

export const runtime = "edge";

export default async function CattleDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <CattleDetailContainer id={id} />;
}
