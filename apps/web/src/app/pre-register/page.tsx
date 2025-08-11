import PreRegisterFormContainer from "@/features/pre-register/form/container";

export const runtime = "edge";

export default function PreRegisterPage() {
	return (
		<main className="p-4">
			<h1 className="text-xl mb-4">事前登録</h1>
			<PreRegisterFormContainer />
		</main>
	);
}
