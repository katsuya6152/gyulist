import { GetCattleList } from "@/services/cattleService";
import { notFound } from "next/navigation";
import { CattleListPresentation } from "./presentational";

export const runtime = "edge";

export default async function CattleListContainer() {
	let cattleList: Awaited<ReturnType<typeof GetCattleList>>;

	try {
		cattleList = await GetCattleList();
	} catch (e) {
		console.error(e);
		notFound();
	}

	if (!cattleList) {
		notFound();
	}

	return <CattleListPresentation cattleList={cattleList} />;
}
