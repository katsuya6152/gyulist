import { z } from "zod";

export const preRegisterSchema = z.object({
	email: z
		.string({ required_error: "必須項目です" })
		.trim()
		.toLowerCase()
		.email("無効なメールアドレスです"),
	referralSource: z.string().optional(),
	turnstileToken: z.string({ required_error: "必須項目です" }),
});

export type PreRegisterInput = z.infer<typeof preRegisterSchema>;

export type PreRegisterSuccess = {
	ok: true;
	alreadyRegistered?: boolean;
};

export type PreRegisterError = {
	ok: false;
	code: string;
	fieldErrors?: Record<string, string>;
};

export type PreRegisterResponse = PreRegisterSuccess | PreRegisterError;

export async function preRegister(
	data: PreRegisterInput,
): Promise<PreRegisterResponse> {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pre-register`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		},
	);
	const json = (await res.json()) as PreRegisterResponse;
	return json;
}
