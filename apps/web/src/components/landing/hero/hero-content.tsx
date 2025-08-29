import Link from "next/link";

export function HeroContent() {
	return (
		<div className="text-center md:text-left">
			{/* 見出し：バランス排版＆サイズクランプ */}
			<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight [text-wrap:balance]">
				{/* text-[clamp(28px,7vw,40px)] */}
				畜産経営を
				<br className="md:block sm:hidden" />
				データで支える
			</h1>

			<p className="w-full mt-3 text-gray-700 text-base md:text-xl leading-relaxed md:leading-8 md:max-w-none">
				個体・繁殖・健康のデータを一元管理。
				<br />
				紙とExcelは、卒業。
			</p>

			<div className="mt-6">
				{/* ヒーローCTA：デモ / 事前登録 / お問い合わせ */}
				<div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-center md:justify-start max-w-xl mx-auto md:mx-0">
					<div className="flex gap-3">
						<Link
							href="/login"
							className="inline-flex justify-center items-center border border-primary text-primary px-6 py-3 rounded-full font-semibold tracking-wide hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
							data-cta="hero-demo"
						>
							デモを触ってみる
						</Link>
						<Link
							href="#waitlist"
							className="inline-flex justify-center items-center bg-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
							data-cta="hero-waitlist"
						>
							事前登録
						</Link>
					</div>
					<Link
						href="/contact"
						className="inline-flex justify-center items-center border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
						data-cta="hero-contact"
					>
						お問い合わせ
					</Link>
				</div>
				<p className="mt-2 text-xs text-gray-500">
					クレカ不要・デモは即時 / 事前登録で先行案内・特典あり
				</p>
			</div>
		</div>
	);
}
