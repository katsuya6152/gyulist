const cases = [
	{
		name: "牧場オーナー Aさん",
		desc: "牛 120頭規模",
		quote:
			"紙の台帳から置き換えることで、分娩予定の把握と記録の共有が楽になりそう。新人にも引き継ぎやすそうです。"
	},
	{
		name: "肉牛農家 Bさん",
		desc: "牛 20頭規模",
		quote:
			"スマホからすぐ記録できるので、作業の合間でも忘れず登録できそう。繁殖状況も一目で分かりやすい。"
	},
	{
		name: "牧場オーナー Cさん",
		desc: "牛 200頭規模",
		quote:
			"血統や繁殖履歴がすぐに見られるので、種付けの計画が立てやすそうです。紙の管理よりずっとスピーディです。"
	}
];

export function CasesSection() {
	return (
		<section id="cases" className="py-16 md:py-20 bg-white">
			<div className="container mx-auto px-4">
				<h2 className="text-2xl md:text-3xl font-bold text-center">
					現場の声（デモ評価）
				</h2>
				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
					{cases.map((i) => (
						<figure
							key={`${i.name}-${i.desc}`}
							className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 ring-1 ring-gray-100 shadow-sm"
						>
							<blockquote className="text-gray-700 text-sm leading-relaxed">
								{i.quote}
							</blockquote>
							<figcaption className="mt-4 flex items-center gap-3">
								<div>
									<div className="text-sm font-semibold">{i.name}</div>
									<div className="text-xs text-gray-500">{i.desc}</div>
								</div>
							</figcaption>
						</figure>
					))}
				</div>
			</div>
		</section>
	);
}
