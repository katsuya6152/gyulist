import CattleEditContainer from "@/features/cattle/edit/container";

export const runtime = "edge";

export default async function CattleEditPage({
	params
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <CattleEditContainer id={id} />;
}
