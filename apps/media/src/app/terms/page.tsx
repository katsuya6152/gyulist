import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata = {
	title: "利用規約",
	description: "Gyulist Mediaの利用規約についてご案内します。"
};

export default function TermsPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<Breadcrumbs items={[{ label: "利用規約" }]} className="mb-8" />

			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold text-foreground mb-8">利用規約</h1>

				<div className="prose prose-lg max-w-none space-y-8">
					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							第1条（適用）
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							本規約は、Gyulist
							Media（以下「当サイト」）が提供するサービスの利用条件を定めるものです。
							ユーザーは、当サイトを利用することにより、本規約に同意したものとみなされます。
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							第2条（利用登録）
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							当サイトは基本的に自由にご利用いただけますが、お問い合わせ等の際は以下の条件を満たす必要があります：
						</p>
						<ul className="list-disc list-inside text-muted-foreground space-y-1">
							<li>提供する情報が真実、正確、最新であること</li>
							<li>反社会的勢力でないこと</li>
							<li>過去に本規約に違反して利用停止措置を受けていないこと</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							第3条（禁止事項）
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							ユーザーは、当サイトの利用にあたり、以下の行為をしてはなりません：
						</p>
						<ul className="list-disc list-inside text-muted-foreground space-y-1">
							<li>法令または公序良俗に違反する行為</li>
							<li>犯罪行為に関連する行為</li>
							<li>当サイトの内容を無断で複製、転載、改変する行為</li>
							<li>
								当サイトのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
							</li>
							<li>当サイトのサービスの運営を妨害するおそれのある行為</li>
							<li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
							<li>不正アクセスをし、またはこれを試みる行為</li>
							<li>他のユーザーに成りすます行為</li>
							<li>
								当サイトに関連して、反社会的勢力に対して直接または間接に利益を供与する行為
							</li>
							<li>その他、当社が不適切と判断する行為</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							第4条（当サイトの提供の停止等）
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく
							当サイトの全部または一部の提供を停止または中断することができるものとします：
						</p>
						<ul className="list-disc list-inside text-muted-foreground space-y-1">
							<li>
								当サイトにかかるコンピュータシステムの保守点検または更新を行う場合
							</li>
							<li>
								地震、落雷、火災、停電または天災などの不可抗力により、当サイトの提供が困難となった場合
							</li>
							<li>コンピュータまたは通信回線等が事故により停止した場合</li>
							<li>その他、当社が当サイトの提供が困難と判断した場合</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							第5条（著作権）
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							当サイトに掲載されているコンテンツ（文章、画像、動画等）の著作権は、
							当社または正当な権利者に帰属します。
						</p>
						<p className="text-muted-foreground leading-relaxed">
							ユーザーは、当社の事前の許可なく、これらのコンテンツを複製、転載、
							改変、販売等することはできません。
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							第6条（利用制限および登録抹消）
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、
							当該ユーザーに対して当サイトの全部もしくは一部の利用を制限し、
							またはユーザーとしての登録を抹消することができるものとします：
						</p>
						<ul className="list-disc list-inside text-muted-foreground space-y-1">
							<li>本規約のいずれかの条項に違反した場合</li>
							<li>登録事項に虚偽の事実があることが判明した場合</li>
							<li>その他、当社が当サイトの利用を適当でないと判断した場合</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							第7条（免責事項）
						</h2>
						<div className="space-y-4">
							<p className="text-muted-foreground leading-relaxed">
								当社は、当サイトに事実と異なる情報が掲載される可能性があることを
								ユーザーが理解し、これに同意されたものとみなします。
							</p>
							<p className="text-muted-foreground leading-relaxed">
								当社は、当サイトに掲載される情報の正確性、有用性、完全性、
								その他一切の事項について保証をするものではなく、
								当サイトの利用によってユーザーに生じたあらゆる損害について
								一切の責任を負いません。
							</p>
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							第8条（サービス内容の変更等）
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							当社は、ユーザーに通知することなく、当サイトで提供するサービスの内容を
							変更、追加または廃止することがあり、ユーザーはこれに同意するものとします。
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							第9条（利用規約の変更）
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							当社は、必要と判断した場合には、ユーザーに通知することなく
							いつでも本規約を変更することができるものとします。
							なお、本規約の変更後、当サイトの利用を開始した場合には、
							当該ユーザーは変更後の規約に同意したものとみなします。
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							第10条（個人情報の取扱い）
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							当社は、当サイトの利用によって取得する個人情報については、
							当社「プライバシーポリシー」に従い適切に取り扱うものとします。
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							第11条（準拠法・裁判管轄）
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							本規約の解釈にあたっては、日本法を準拠法とします。
							当サイトに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を
							専属的合意管轄とします。
						</p>
					</section>

					<div className="text-center mt-12 pt-8 border-t">
						<p className="text-muted-foreground">最終更新日: 2024年1月1日</p>
					</div>
				</div>
			</div>
		</div>
	);
}
