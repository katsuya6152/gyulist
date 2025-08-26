import { GetCattleDetail } from "@/services/cattleService";
import CattleDetailPresentation from "./presentational";

export default async function CattleDetailContainer({ id }: { id: string }) {
	try {
		const cattle = await GetCattleDetail(id);

		return <CattleDetailPresentation cattle={cattle} />;
	} catch (error) {
		console.error("[CattleDetailContainer] APIリクエスト失敗:", error);
		return (
			<CattleDetailPresentation
				cattle={undefined}
				error="牛の情報の取得に失敗しました"
			/>
		);
	}
}
