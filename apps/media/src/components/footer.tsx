import Link from "next/link";
import { ExternalLink, Mail, MessageCircle } from "lucide-react";

const footerLinks = {
	サイト: [
		{ name: "ホーム", href: "/" },
		{ name: "記事一覧", href: "/posts" },
		{ name: "カテゴリ", href: "/categories" },
		{ name: "タグ", href: "/tags" }
	],
	ギュウリスト: [
		{
			name: "ギュウリストについて",
			href: "https://gyulist.com",
			external: true
		},
		{ name: "機能紹介", href: "https://gyulist.com/features", external: true },
		{ name: "料金プラン", href: "https://gyulist.com/pricing", external: true },
		{ name: "サポート", href: "https://gyulist.com/support", external: true }
	],
	サポート: [
		{ name: "お問い合わせ", href: "/contact" },
		{ name: "プライバシーポリシー", href: "/privacy" },
		{ name: "利用規約", href: "/terms" },
		{ name: "サイトマップ", href: "/sitemap" }
	]
};

export function Footer() {
	return (
		<footer className="border-t bg-muted/30">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* ブランド情報 */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
								<span className="text-primary-foreground font-bold text-sm">
									G
								</span>
							</div>
							<span className="font-bold text-lg text-foreground">
								ギュウリスト <span className="text-primary">Media</span>
							</span>
						</div>
						<p className="text-sm text-muted-foreground leading-relaxed">
							牛の管理・飼育に関する最新情報をお届けします。効率的な牧場経営をサポートするギュウリストの公式メディアです。
						</p>
						<div className="flex space-x-2">
							<Link
								href="https://line.me/R/ti/p/@gyulist"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
							>
								<MessageCircle className="h-4 w-4" />
								<span className="sr-only">LINE</span>
							</Link>
							<Link
								href="mailto:support@gyulist.jp"
								className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
							>
								<Mail className="h-4 w-4" />
								<span className="sr-only">メール</span>
							</Link>
						</div>
					</div>

					{/* リンクセクション */}
					{Object.entries(footerLinks).map(([category, links]) => (
						<div key={category} className="space-y-4">
							<h3 className="font-semibold text-foreground">{category}</h3>
							<ul className="space-y-2">
								{links.map((link) => (
									<li key={link.name}>
										<Link
											href={link.href}
											target={
												"external" in link && link.external
													? "_blank"
													: undefined
											}
											rel={
												"external" in link && link.external
													? "noopener noreferrer"
													: undefined
											}
											className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
										>
											{link.name}
											{"external" in link && link.external && (
												<ExternalLink className="ml-1 h-3 w-3" />
											)}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
					<p className="text-sm text-muted-foreground">
						© 2024 Gyulist Media. All rights reserved.
					</p>
					<p className="text-sm text-muted-foreground mt-2 md:mt-0">
						Powered by{" "}
						<Link
							href="https://gyulist.jp"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							Gyulist
						</Link>
					</p>
				</div>
			</div>
		</footer>
	);
}
