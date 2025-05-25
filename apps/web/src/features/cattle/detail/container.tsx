import { CattleDetailPresentation } from "./presentational";

export const runtime = "edge";

export default async function CattleDetailContainer() {
	// TODO: GET /cattle/:id
	// TODO: propsとしてcattleDetailを渡す
	return <CattleDetailPresentation />;
}
