import { fetchCattleList } from "@/services/cattleService";
import { notFound } from "next/navigation";
import { CattleListPresentation } from "./presentational";

export const runtime = "edge";

export default async function CattleListContainer() {
	let cattleList: Awaited<ReturnType<typeof fetchCattleList>>;

	try {
		cattleList = await fetchCattleList();
	} catch (e) {
		console.error(e);
		notFound();
	}

	if (!cattleList) {
		notFound();
	}

	return <CattleListPresentation cattleList={cattleList} />;
}
