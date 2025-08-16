import CattleListContainer from "@/features/cattle/list/container";

export const runtime = "edge";

export default async function CattlePage({
	searchParams
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	return <CattleListContainer searchParams={searchParams} />;
}
