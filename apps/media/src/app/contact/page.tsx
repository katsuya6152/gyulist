import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, ExternalLink } from "lucide-react";

export const metadata = {
	title: "お問い合わせ",
	description: "Gyulist Mediaへのお問い合わせ方法についてご案内します。"
};

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
						ギュウリストに関するご質問やご相談は、統一されたお問い合わせフォームでお気軽にお送りください。 
						<br />
						牧場経営や牛の管理についてのご相談も承っております。
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
					<Card className="h-full transition-all duration-300 hover-lift ring-2 ring-primary/20 bg-gradient-primary/5">
						<CardHeader className="text-center">
							<div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
								<MessageSquare className="h-8 w-8 text-primary" />
							</div>
							<CardTitle className="text-xl">お問い合わせフォーム</CardTitle>
						</CardHeader>
						<CardContent className="text-center">
							<p className="text-muted-foreground mb-6 leading-relaxed">
								お問い合わせフォームから、ギュウリストに関するご質問やご相談をお送りください。
								記事の転載・引用、執筆依頼など、お気軽にお問い合わせください。
							</p>
							<Button
								asChild
								variant="default"
								className="w-full"
							>
								<Link href="https://gyulist.com/contact">
									お問い合わせフォームへ
								</Link>
							</Button>
						</CardContent>
					</Card>

					<Card className="h-full transition-all duration-300 hover-lift bg-gradient-card">
						<CardHeader className="text-center">
							<div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
								<ExternalLink className="h-8 w-8 text-primary" />
							</div>
							<CardTitle className="text-xl">ギュウリスト公式サイト</CardTitle>
						</CardHeader>
						<CardContent className="text-center">
							<p className="text-muted-foreground mb-6 leading-relaxed">
								サービスの詳細情報やよくある質問については公式サイトをご覧ください。
								デモ体験や事前登録も可能です。
							</p>
							<Button
								asChild
								variant="outline"
								className="w-full"
							>
								<Link
									href="https://gyulist.com"
									target="_blank"
									rel="noopener noreferrer"
								>
									公式サイトを見る
								</Link>
							</Button>
						</CardContent>
					</Card>
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
								適切な出典表記をしていただければ、記事の引用は可能です。転載をご希望の場合はお問い合わせフォームからご連絡ください。
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-2">
								Q. 記事の執筆依頼は受け付けていますか？
							</h3>
							<p className="text-muted-foreground text-sm">
								A.
								牧場経営や牛の管理に関する専門的な記事の執筆依頼を承っております。詳細はお問い合わせフォームからご連絡ください。
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-2">
								Q. ギュウリストについて詳しく知りたいです。
							</h3>
							<p className="text-muted-foreground text-sm">
								A.
								ギュウリスト公式サイトで詳細をご確認いただけます。また、お問い合わせフォームからもご相談いただけます。
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
