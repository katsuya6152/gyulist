import { CattleEditPresentation } from "./presentational";

export const runtime = "edge";

export default async function CattleEditContainer() {
	// TODO: PUT /cattle/:id
	// TODO: propsとしてcattleDetailを渡す
	// TODO: propsとしてonSubmitを渡す
	return <CattleEditPresentation />;
}
