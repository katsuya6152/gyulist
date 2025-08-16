import { GetCattleDetail } from "@/services/cattleService";
import CattleEditPresentation from "./presentational";

interface CattleEditContainerProps {
	id: string;
}

export default async function CattleEditContainer({
	id
}: CattleEditContainerProps) {
	const cattle = await GetCattleDetail(id);
	return <CattleEditPresentation cattle={cattle} />;
}
