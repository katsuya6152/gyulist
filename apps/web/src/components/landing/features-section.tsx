export function FeaturesSection() {
	return (
		<section id="features" className="py-16 md:py-20 bg-gray-50">
			<div className="container mx-auto px-4">
				<h2 className="text-2xl md:text-3xl font-bold text-center animate-fade-in">
					すべての管理を、成果につなげる
				</h2>
				<p className="mt-3 text-center text-gray-600 animate-slide-up-delayed">
					機能の羅列ではなく、現場で効くワークフローをご提供します。
				</p>
				<div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[
						{
							title: "個体管理",
							desc: "個体識別番号・体重・ワクチン履歴を一元管理。検索は0.2秒。",
							icon: "📇",
						},
						{
							title: "繁殖管理",
							desc: "発情検知・授精・妊鑑・分娩をタイムラインで可視化。抜け漏れゼロ。",
							icon: "🗓️",
						},
						{
							title: "血統管理",
							desc: "父母・兄弟から血統を自動生成。交配の近交係数チェックも。",
							icon: "🌳",
						},
						{
							title: "健康管理",
							desc: "削蹄・投薬・疾病をスマホで記録。異常はリマインドでフォロー。",
							icon: "🩺",
						},
					].map((feature, index) => (
						<div
							key={feature.title}
							className={`bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up-delayed-${index + 2}`}
							style={{ animationDelay: `${0.2 + index * 0.1}s` }}
						>
							<div
								className="text-3xl mb-3 animate-bounce-subtle"
								aria-hidden
								style={{ animationDelay: `${1 + index * 0.2}s` }}
							>
								{feature.icon}
							</div>
							<h3 className="mt-3 font-semibold text-lg">{feature.title}</h3>
							<p className="mt-2 text-gray-600 text-sm">{feature.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
