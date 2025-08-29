import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
	return (
		<footer className="bg-gray-950 text-gray-300">
			<div className="container mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
				<div>
					<div className="flex items-center gap-2">
						<Image
							src="/icon-horizontal.svg"
							alt="ギュウリスト"
							width={96}
							height={31}
							sizes="96px"
							loading="lazy"
						/>
					</div>
					<p className="mt-3 text-gray-400">
						畜産管理をもっとスマートに。現場と経営をつなぐクラウド。
					</p>
				</div>
				<div>
					<h3 className="font-semibold text-white mb-4">サポート</h3>
					<ul className="space-y-2">
						<li>
							<Link
								href="/contact"
								className="hover:text-white transition-colors"
							>
								お問い合わせ
							</Link>
						</li>
						<li>
							<Link href="#faq" className="hover:text-white transition-colors">
								よくある質問
							</Link>
						</li>
					</ul>
				</div>
			</div>
			<div className="border-t border-white/10">
				<div className="container mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-400">
					<div>© {new Date().getFullYear()} GyuList</div>
					<div className="flex items-center gap-4">
						<span>Pre-release</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
