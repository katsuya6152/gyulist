const faqItems = [
	{
		q: "オフラインでも使えますか？",
		a: "はい。電波が弱くても保存。つながると自動同期します。",
	},
	{
		q: "データの移行はできますか？",
		a: "既存のExcel/CSVからインポート可能。移行サポートも対応します。",
	},
	{
		q: "セキュリティは？",
		a: "通信はTLSで暗号化。国内クラウドで保管し、定期バックアップを実施。",
	},
	{
		q: "デモと正式版の違いは？",
		a: "デモはサンプルで体験。正式版では実データ登録や連携、通知/バックアップが利用可。",
	},
	{
		q: "事前登録のメリットは？",
		a: "先行案内・限定特典・オンボーディング優先を提供。",
	},
];

export function FAQSection() {
	return (
		<section id="faq" className="py-16 md:py-20 bg-white">
			<div className="container mx-auto px-4 max-w-3xl">
				<h2 className="text-2xl md:text-3xl font-bold text-center">
					よくある質問
				</h2>
				<div className="mt-8 divide-y divide-gray-200 border border-gray-200 rounded-2xl">
					{faqItems.map((item) => (
						<details key={item.q} className="group open:bg-gray-50">
							<summary className="cursor-pointer list-none p-4 md:p-5 font-semibold flex items-center justify-between leading-tight">
								{item.q}
								<span
									aria-hidden
									className="transition-transform group-open:rotate-45"
								>
									＋
								</span>
							</summary>
							<div className="px-4 md:px-5 pb-5 text-gray-700 text-sm leading-relaxed">
								{item.a}
							</div>
						</details>
					))}
				</div>
			</div>
		</section>
	);
}
