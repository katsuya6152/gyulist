"use server";

import { slackService } from "@/services/slackService";

interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	message: string;
}

interface ContactFormResult {
	success: boolean;
	error?: string;
}

export async function submitContactForm(
	data: ContactFormData
): Promise<ContactFormResult> {
	try {
		// バリデーション
		if (!data.name || !data.email || !data.subject || !data.message) {
			return {
				success: false,
				error: "すべての項目を入力してください"
			};
		}

		// メールアドレスの形式チェック
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(data.email)) {
			return {
				success: false,
				error: "正しいメールアドレスを入力してください"
			};
		}

		// ログ出力
		console.log("=== お問い合わせ受信 ===");
		console.log(`受信日時: ${new Date().toISOString()}`);
		console.log(`お名前: ${data.name}`);
		console.log(`メールアドレス: ${data.email}`);
		console.log(`件名: ${data.subject}`);
		console.log("お問い合わせ内容:");
		console.log(data.message);
		console.log("========================");

		// Slackに送信
		try {
			const slackResult = await slackService.sendContactNotification(data);
			if (slackResult) {
				console.log("Slackへの送信が完了しました");
			} else {
				console.warn("Slackへの送信に失敗しました");
			}
		} catch (slackError) {
			console.error("Slack送信エラー:", slackError);
			// Slack送信エラーでもお問い合わせ自体は成功とする
		}

		// 成功レスポンス
		return {
			success: true
		};
	} catch (error) {
		console.error("Contact form submission error:", error);
		return {
			success: false,
			error: "送信に失敗しました。しばらく時間をおいて再度お試しください。"
		};
	}
}
