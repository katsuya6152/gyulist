import { CattleNewPresentation } from "./presentational";

export const runtime = "edge";

export default async function CattleNewContainer() {
	// TODO: POST /cattle
	// TODO: propsとしてonSubmitを渡す（成功時の表示とリダイレクト）
	return <CattleNewPresentation />;
}
