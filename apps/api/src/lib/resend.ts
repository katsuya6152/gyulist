export async function sendCompletionEmail(
	apiKey: string,
	from: string,
	to: string,
	referralSource: string | null,
) {
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from,
			to,
			subject: "事前登録ありがとうございます",
			html: `<p>Gyulistへの事前登録が完了しました。</p><p>登録メール: ${to}</p><p>どこで知ったか: ${referralSource ?? ""}</p>`,
		}),
	});
	if (!res.ok) {
		throw new Error(`resend error: ${res.status}`);
	}
	return (await res.json()) as { id: string };
}
