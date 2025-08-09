export function CasesSection() {
	return (
		<section id="cases" className="py-16 md:py-20 bg-white">
			<div className="container mx-auto px-4">
				<h2 className="text-2xl md:text-3xl font-bold text-center">
					現場の声（デモ評価）
				</h2>
				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<figure
							key={i}
							className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 ring-1 ring-gray-100 shadow-sm"
						>
							<blockquote className="text-gray-700 text-sm leading-relaxed">
								紙の台帳から置き換え、分娩予定の把握と記録の共有が楽になりました。新人にも引き継ぎやすいです。
							</blockquote>
							<figcaption className="mt-4 flex items-center gap-3">
								<div>
									<div className="text-sm font-semibold">
										牧場オーナー Aさん
									</div>
									<div className="text-xs text-gray-500">繁殖牛 120頭規模</div>
								</div>
							</figcaption>
						</figure>
					))}
				</div>
			</div>
		</section>
	);
}
