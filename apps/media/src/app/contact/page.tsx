import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, MessageCircle, ExternalLink } from "lucide-react";

export const metadata = {
	title: "お問い合わせ",
	description: "Gyulist Mediaへのお問い合わせ方法についてご案内します。"
};

const contactMethods = [
	{
		title: "LINEでお問い合わせ",
		description:
			"最も迅速な対応が可能です。お気軽にメッセージをお送りください。",
		icon: MessageCircle,
		href: "https://line.me/R/ti/p/@gyulist",
		buttonText: "LINEで相談する",
		primary: true
	},
	{
		title: "メールでお問い合わせ",
		description:
			"詳細なお問い合わせや資料の送付をご希望の場合はメールをご利用ください。",
		icon: Mail,
		href: "mailto:support@gyulist.jp",
		buttonText: "メールを送る",
		primary: false
	},
	{
		title: "Gyulist公式サイト",
		description:
			"サービスの詳細情報やよくある質問については公式サイトをご覧ください。",
		icon: ExternalLink,
		href: "https://gyulist.jp",
		buttonText: "公式サイトを見る",
		primary: false
	}
];

export default function ContactPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<Breadcrumbs items={[{ label: "お問い合わせ" }]} className="mb-8" />

			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-foreground mb-4">
						お問い合わせ
					</h1>
					<p className="text-lg text-muted-foreground leading-relaxed">
						Gyulist
						Mediaに関するご質問やご相談は、以下の方法でお気軽にお問い合わせください。
						<br />
						牧場経営や牛の管理についてのご相談も承っております。
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					{contactMethods.map((method) => {
						const IconComponent = method.icon;
						return (
							<Card
								key={method.title}
								className={`h-full transition-all duration-300 hover-lift ${
									method.primary
										? "ring-2 ring-primary/20 bg-gradient-primary/5"
										: "bg-gradient-card"
								}`}
							>
								<CardHeader className="text-center">
									<div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
										<IconComponent className="h-8 w-8 text-primary" />
									</div>
									<CardTitle className="text-xl">{method.title}</CardTitle>
								</CardHeader>
								<CardContent className="text-center">
									<p className="text-muted-foreground mb-6 leading-relaxed">
										{method.description}
									</p>
									<Button
										asChild
										variant={method.primary ? "default" : "outline"}
										className="w-full"
									>
										<Link
											href={method.href}
											target={
												method.href.startsWith("http") ? "_blank" : undefined
											}
											rel={
												method.href.startsWith("http")
													? "noopener noreferrer"
													: undefined
											}
										>
											{method.buttonText}
										</Link>
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>

				<Card className="bg-muted/30">
					<CardHeader>
						<CardTitle className="text-center">よくある質問</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<h3 className="font-semibold text-foreground mb-2">
								Q. 記事の転載や引用は可能ですか？
							</h3>
							<p className="text-muted-foreground text-sm">
								A.
								適切な出典表記をしていただければ、記事の引用は可能です。転載をご希望の場合は事前にお問い合わせください。
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-2">
								Q. 記事の執筆依頼は受け付けていますか？
							</h3>
							<p className="text-muted-foreground text-sm">
								A.
								牧場経営や牛の管理に関する専門的な記事の執筆依頼を承っております。詳細はお問い合わせください。
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-2">
								Q. Gyulistサービスについて詳しく知りたいです。
							</h3>
							<p className="text-muted-foreground text-sm">
								A.
								Gyulist公式サイトで詳細をご確認いただけます。また、LINEでの個別相談も承っております。
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
