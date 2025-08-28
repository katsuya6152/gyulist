import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata = {
	title: "プライバシーポリシー",
	description: "Gyulist Mediaのプライバシーポリシーについてご案内します。"
};

export default function PrivacyPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<Breadcrumbs
				items={[{ label: "プライバシーポリシー" }]}
				className="mb-8"
			/>

			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold text-foreground mb-8">
					プライバシーポリシー
				</h1>

				<div className="prose prose-lg max-w-none space-y-8">
					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							1. 個人情報の取り扱いについて
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							Gyulist
							Media（以下「当サイト」）では、ユーザーの個人情報の保護を重要視し、
							個人情報保護法及び関連法令を遵守し、適切な取り扱いを行います。
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							2. 収集する情報
						</h2>
						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-medium text-foreground mb-2">
									2.1 自動的に収集される情報
								</h3>
								<ul className="list-disc list-inside text-muted-foreground space-y-1">
									<li>IPアドレス</li>
									<li>ブラウザの種類とバージョン</li>
									<li>アクセス日時</li>
									<li>閲覧されたページ</li>
									<li>リファラー情報</li>
								</ul>
							</div>
							<div>
								<h3 className="text-lg font-medium text-foreground mb-2">
									2.2 お問い合わせ時に収集される情報
								</h3>
								<ul className="list-disc list-inside text-muted-foreground space-y-1">
									<li>お名前</li>
									<li>メールアドレス</li>
									<li>お問い合わせ内容</li>
								</ul>
							</div>
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							3. 情報の利用目的
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							収集した個人情報は、以下の目的で利用いたします：
						</p>
						<ul className="list-disc list-inside text-muted-foreground space-y-1">
							<li>サイトの運営・改善</li>
							<li>お問い合わせへの対応</li>
							<li>統計データの作成（個人を特定できない形で）</li>
							<li>法的義務の履行</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							4. Cookie（クッキー）について
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							当サイトでは、ユーザーの利便性向上のためCookieを使用しています。
							Cookieは、ウェブサイトがユーザーのコンピューターに保存する小さなテキストファイルです。
						</p>
						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-medium text-foreground mb-2">
									4.1 使用するCookie
								</h3>
								<ul className="list-disc list-inside text-muted-foreground space-y-1">
									<li>サイトの機能に必要なCookie</li>
									<li>アクセス解析のためのCookie（Google Analytics）</li>
									<li>広告配信のためのCookie</li>
								</ul>
							</div>
							<div>
								<h3 className="text-lg font-medium text-foreground mb-2">
									4.2 Cookieの無効化
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									ブラウザの設定により、Cookieを無効にすることができます。
									ただし、一部の機能が正常に動作しない場合があります。
								</p>
							</div>
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							5. アクセス解析ツールについて
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							当サイトでは、Google
							Analyticsを利用してアクセス状況を分析しています。 Google
							Analyticsは、Cookieを使用してユーザーのアクセス情報を収集しますが、
							個人を特定する情報は含まれません。
						</p>
						<p className="text-muted-foreground leading-relaxed">
							Google Analyticsの利用規約及びプライバシーポリシーについては、
							Googleの公式サイトをご確認ください。
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							6. 第三者への情報提供
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							当サイトでは、以下の場合を除き、個人情報を第三者に提供することはありません：
						</p>
						<ul className="list-disc list-inside text-muted-foreground space-y-1">
							<li>ユーザーの同意がある場合</li>
							<li>法令に基づく場合</li>
							<li>人の生命、身体又は財産の保護のために必要がある場合</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							7. 個人情報の開示・訂正・削除
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							ユーザーは、当サイトが保有する個人情報について、開示・訂正・削除を求めることができます。
							ご希望の場合は、お問い合わせフォームよりご連絡ください。
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							8. プライバシーポリシーの変更
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							当サイトでは、必要に応じてプライバシーポリシーを変更することがあります。
							変更した場合は、当ページにて告知いたします。
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							9. お問い合わせ
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください：
						</p>
						<div className="bg-muted/30 p-4 rounded-lg">
							<p className="text-muted-foreground">
								メール: support@gyulist.jp
								<br />
								LINE: @gyulist
							</p>
						</div>
					</section>

					<div className="text-center mt-12 pt-8 border-t">
						<p className="text-muted-foreground">最終更新日: 2024年1月1日</p>
					</div>
				</div>
			</div>
		</div>
	);
}
