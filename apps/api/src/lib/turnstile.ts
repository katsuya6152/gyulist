export async function verifyTurnstile(
	secret: string,
	token: string,
): Promise<boolean> {
	const body = new URLSearchParams({ secret, response: token });
	const res = await fetch(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		{
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body,
		},
	);
	if (!res.ok) {
		throw new Error(`turnstile error: ${res.status}`);
	}
	const data = (await res.json()) as { success?: boolean };
	return data.success === true;
}
