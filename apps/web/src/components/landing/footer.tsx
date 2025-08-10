import Image from "next/image";

export function LandingFooter() {
	return (
		<footer className="bg-gray-950 text-gray-300">
			<div className="container mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
				<div>
					<div className="flex items-center gap-2">
						<picture>
							<source srcSet="/icon-horizontal.webp" type="image/webp" />
							<Image
								src="/icon-horizontal.png"
								alt="ギュウリスト"
								width={96}
								height={31}
								sizes="96px"
								loading="lazy"
							/>
						</picture>
					</div>
					<p className="mt-3 text-gray-400">
						畜産管理をもっとスマートに。現場と経営をつなぐクラウド。
					</p>
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
