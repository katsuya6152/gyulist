import { GetCattleDetail } from "@/services/cattleService";
import CattleDetailPresentation from "./presentational";

export default async function CattleDetailContainer({ id }: { id: string }) {
	const cattle = await GetCattleDetail(id);
	return <CattleDetailPresentation cattle={cattle} />;
}
