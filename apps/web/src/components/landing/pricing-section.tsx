import Link from "next/link";

const pricingPlans = [
	{
		name: "フリーデモ",
		price: "無料",
		features: ["ログイン不要", "主要機能を体験", "フィードバック歓迎"]
	},
	{
		name: "アーリーアクセス",
		price: "事前登録者向け",
		features: ["正式版へ先行招待", "優先サポート", "特典適用"]
	},
	{
		name: "正式版",
		price: "近日公開",
		features: [
			"詳細はメールで案内",
			"基本無料＆柔軟な料金プラン",
			"契約縛りなし"
		]
	}
];

export function PricingSection() {
	return (
		<section id="pricing" className="py-16 md:py-20 bg-gray-50">
			<div className="container mx-auto px-4">
				<h2 className="text-2xl md:text-3xl font-bold text-center animate-fade-in">
					料金（ローンチ時に公開）
				</h2>
				<p className="mt-2 text-center text-gray-600 animate-slide-up-delayed">
					いまはプレリリース。デモで体験し、事前登録で最新情報を受け取れます。
				</p>
				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
					{pricingPlans.map((plan, index) => (
						<div
							key={plan.name}
							className={`rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up-delayed-${index + 2} ${
								plan.name === "アーリーアクセス"
									? "border-2 border-primary animate-pulse-subtle"
									: ""
							}`}
							style={{ animationDelay: `${0.2 + index * 0.1}s` }}
						>
							<div className="text-sm text-gray-500">{plan.name}</div>
							<div className="mt-1 text-3xl font-extrabold">{plan.price}</div>
							<ul className="mt-4 space-y-2 text-sm text-gray-700">
								{plan.features.map((feature) => (
									<li
										key={feature}
										className="flex gap-2 hover:text-blue-600 transition-colors duration-200"
									>
										<span aria-hidden className="text-green-500">
											•
										</span>
										{feature}
									</li>
								))}
							</ul>
							{plan.name === "フリーデモ" && (
								<Link
									href="/login"
									className="mt-6 inline-flex justify-center items-center w-full px-4 py-2.5 rounded-full font-semibold text-primary border border-primary hover:bg-primary hover:text-white hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
									data-cta={`pricing-${plan.name}`}
								>
									デモで試す
								</Link>
							)}
							{plan.name === "アーリーアクセス" && (
								<Link
									href="#waitlist"
									className="mt-6 inline-flex justify-center items-center w-full px-4 py-2.5 rounded-full font-semibold bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
									data-cta={`pricing-${plan.name}`}
								>
									事前登録する
								</Link>
							)}
							{plan.name === "正式版" && (
								<button
									type="button"
									disabled
									className="mt-6 inline-flex justify-center items-center w-full px-4 py-2.5 rounded-full font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
								>
									近日公開
								</button>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
