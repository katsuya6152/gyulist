interface SlackMessage {
	text: string;
	blocks?: Array<{
		type: string;
		text?: {
			type: string;
			text: string;
		};
		fields?: Array<{
			type: string;
			text: string;
		}>;
		elements?: Array<{
			type: string;
			text: string;
		}>;
	}>;
}

interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	message: string;
}

export class SlackService {
	private webhookUrl: string;

	constructor() {
		this.webhookUrl = process.env.SLACK_WEBHOOK_URL || "";
	}

	/**
	 * お問い合わせをSlackに送信
	 */
	async sendContactNotification(
		contactData: ContactFormData
	): Promise<boolean> {
		try {
			if (!this.webhookUrl) {
				console.error("SLACK_WEBHOOK_URLが設定されていません");
				return false;
			}

			const message = this.createContactMessage(contactData);
			const response = await fetch(this.webhookUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(message)
			});

			if (!response.ok) {
				throw new Error(
					`Slack API error: ${response.status} ${response.statusText}`
				);
			}

			console.log("Slackへの送信が完了しました");
			return true;
		} catch (error) {
			console.error("Slack送信エラー:", error);
			return false;
		}
	}

	/**
	 * お問い合わせ用のSlackメッセージを作成
	 */
	private createContactMessage(contactData: ContactFormData): SlackMessage {
		const subjectLabels: Record<string, string> = {
			general: "一般的なお問い合わせ",
			technical: "技術的なサポート",
			feature: "機能のご要望",
			bug: "バグの報告",
			billing: "料金に関するお問い合わせ",
			other: "その他"
		};

		const subjectLabel =
			subjectLabels[contactData.subject] || contactData.subject;
		const timestamp = new Date().toLocaleString("ja-JP", {
			timeZone: "Asia/Tokyo"
		});

		return {
			text: `新しいお問い合わせが届きました: ${subjectLabel}`,
			blocks: [
				{
					type: "header",
					text: {
						type: "plain_text",
						text: "📧 新しいお問い合わせ"
					}
				},
				{
					type: "section",
					fields: [
						{
							type: "mrkdwn",
							text: `*お名前:*\n${contactData.name}`
						},
						{
							type: "mrkdwn",
							text: `*メールアドレス:*\n${contactData.email}`
						}
					]
				},
				{
					type: "section",
					fields: [
						{
							type: "mrkdwn",
							text: `*件名:*\n${subjectLabel}`
						},
						{
							type: "mrkdwn",
							text: `*受信日時:*\n${timestamp}`
						}
					]
				},
				{
					type: "section",
					text: {
						type: "mrkdwn",
						text: `*お問い合わせ内容:*\n\`\`\`${contactData.message}\`\`\``
					}
				},
				{
					type: "divider"
				},
				{
					type: "context",
					elements: [
						{
							type: "mrkdwn",
							text: "Gyulist お問い合わせシステム"
						}
					]
				}
			]
		};
	}
}

// シングルトンインスタンス
export const slackService = new SlackService();
