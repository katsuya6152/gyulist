import Link from "next/link";

const perks = ["先行案内", "限定特典", "データ移行優先"];

export function PerksSection() {
	return (
		<section id="perks" className="py-12 md:py-16 bg-white">
			<div className="container mx-auto px-4">
				<div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-blue-50 to-white ring-1 ring-blue-100">
					<h2 className="text-2xl md:text-3xl font-bold text-center">
						事前登録で受け取れる特典
					</h2>
					<ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-800">
						{perks.map((perk) => (
							<li
								key={perk}
								className="bg-white rounded-xl p-5 ring-1 ring-gray-100 shadow-sm text-center"
							>
								{perk}
							</li>
						))}
					</ul>
					<div className="mt-6 text-center">
						<Link
							href="#waitlist"
							className="inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
							data-cta="perks-waitlist"
						>
							事前登録する
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
