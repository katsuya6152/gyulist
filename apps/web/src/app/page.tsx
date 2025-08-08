"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * プレリリース向けCVR最適化
 * 主要CV：①デモ体験 ②事前登録（Waitlist）
 */

export default function Home() {
	const [email, setEmail] = useState("");
	const [isStickyVisible, setStickyVisible] = useState(false);
	// const [announceOpen, setAnnounceOpen] = useState(true);

	useEffect(() => {
		// 構造化データをheadに追加
		const script = document.createElement("script");
		script.type = "application/ld+json";
		script.text = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "ギュウリスト",
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
			releaseNotes: "Pre-release: Demo available / Waitlist open",
		});
		document.head.appendChild(script);

		// スクロールイベント
		const onScroll = () => setStickyVisible(window.scrollY > 480);
		window.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", onScroll);
			// クリーンアップ時にscriptを削除
			if (script.parentNode) {
				document.head.removeChild(script);
			}
		};
	}, []);

	const handleLeadSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// 実運用ではAPI呼び出しに差し替え
		window.location.href = `/waitlist?email=${encodeURIComponent(email)}`;
	};

	return (
		<>
			<header className="sticky top-0 z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-100">
				{/* アナウンスバー */}
				{/* {announceOpen && (
					<div className="w-full bg-blue-50 text-blue-900 text-sm">
						<div className="container mx-auto px-4 h-10 flex items-center justify-between">
							<p className="truncate">
								現在 <strong>プレリリース</strong> です.
								<Link href="/login" className="underline font-semibold ml-2">
									デモで体験
								</Link>{" "}
								/{" "}
								<Link href="#waitlist" className="underline font-semibold ml-1">
									事前登録
								</Link>
							</p>
							<button
								type="button"
								aria-label="閉じる"
								className="p-1"
								onClick={() => setAnnounceOpen(false)}
							>
								×
							</button>
						</div>
					</div>
				)} */}
				<div className="container mx-auto px-4 h-14 flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center gap-2"
						aria-label="ギュウリスト ホームへ"
					>
						<Image
							src="/icon-horizontal.png"
							alt="ギュウリスト"
							width={96}
							height={96}
						/>
					</Link>
					<nav className="hidden md:flex items-center gap-6 text-sm">
						<Link href="#features" className="hover:opacity-80">
							機能
						</Link>
						<Link href="#cases" className="hover:opacity-80">
							導入例
						</Link>
						<Link href="#perks" className="hover:opacity-80">
							特典
						</Link>
						<Link href="#faq" className="hover:opacity-80">
							FAQ
						</Link>
						<Link
							href="/login"
							className="inline-flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-full font-semibold hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
							data-cta="header-demo"
						>
							デモ
						</Link>
						<Link
							href="#waitlist"
							className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
							data-cta="header-waitlist"
						>
							事前登録
						</Link>
					</nav>
					<div className="md:hidden flex items-center gap-2">
						<Link
							href="/login"
							className="inline-flex items-center border border-primary text-primary px-3 py-1.5 rounded-full text-sm font-semibold"
							data-cta="header-demo-mobile"
						>
							デモ
						</Link>
						<Link
							href="#waitlist"
							className="inline-flex items-center bg-primary text-white px-3 py-1.5 rounded-full text-sm font-semibold"
							data-cta="header-waitlist-mobile"
						>
							登録
						</Link>
					</div>
				</div>
			</header>

			<main>
				{/* ヒーロー */}
				<section className="relative overflow-hidden">
					<div className="absolute inset-0 -z-10">
						<div className="hidden md:block">
							<Image
								src="/hero-bg-pc.png"
								alt="牧場の風景"
								fill
								priority
								className="object-cover opacity-70"
							/>
						</div>
						<div className="md:hidden">
							<Image
								src="/hero-bg-sp.png"
								alt="牧場の風景"
								fill
								priority
								className="object-cover opacity-70"
							/>
						</div>
						<div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/70 to-white" />
					</div>

					<div className="container mx-auto px-4 pt-14 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-[1.1fr_0.9fr] items-center gap-10">
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
								{/* ヒーローCTA：デモ / 事前登録 */}
								<div className="flex flex-low gap-3 sm:items-center justify-center md:justify-start max-w-xl mx-auto md:mx-0">
									<Link
										href="/login"
										className="inline-flex justify-center items-center border border-primary text-primary px-6 py-3 rounded-full font-semibold tracking-wide hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
										data-cta="hero-demo"
									>
										デモを触ってみる
									</Link>
									<Link
										href="#waitlist"
										className="inline-flex justify-center items-center bg-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
										data-cta="hero-waitlist"
									>
										事前登録
									</Link>
									{/* <form
										onSubmit={handleLeadSubmit}
										className="flex-1 flex gap-2"
									>
										<label htmlFor="lead-email" className="sr-only">
											事前案内を受け取るメール
										</label>
										<input
											id="lead-email"
											type="email"
											required
											inputMode="email"
											placeholder="事前案内を受け取るメール"
											className="w-full h-12 bg-white/95 border border-gray-300 rounded-full px-5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
										<button
											type="submit"
											className="w-full inline-flex justify-center items-center bg-blue-600 text-white px-5 py-3 rounded-full font-semibold tracking-wide hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
											data-cta="hero-waitlist"
										>
											事前登録する
										</button>
									</form> */}
								</div>
								<p className="mt-2 text-xs text-gray-500">
									クレカ不要・デモは即時 / 事前登録で先行案内・特典あり
								</p>
							</div>

							<div className="mt-6 flex items-center justify-center md:justify-start gap-6 text-gray-500 text-xs md:text-sm">
								{/* <div className="flex items-center gap-2">
									<span aria-hidden>🔒</span> 通信はTLSで保護
								</div> */}
								<div className="flex items-center gap-2">
									<span aria-hidden>🪪</span> 個体識別対応
								</div>
								<div className="flex items-center gap-2">
									<span aria-hidden>🚀</span> プレリリース中
								</div>
							</div>
						</div>

						<div className="relative aspect-[4/3] md:aspect-[5/4] w-full h-full rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden motion-safe:animate-[fadeIn_700ms_ease_1_100ms]">
							<Image
								src="/app-shot.png"
								alt="ギュウリストの画面"
								className="object-contain"
								priority
								fill
							/>
						</div>
					</div>
				</section>

				{/* 早期登録特典 */}
				<section id="perks" className="py-12 md:py-16 bg-white">
					<div className="container mx-auto px-4">
						<div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-blue-50 to-white ring-1 ring-blue-100">
							<h2 className="text-2xl md:text-3xl font-bold text-center">
								事前登録で受け取れる特典
							</h2>
							<ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-800">
								<li className="bg-white rounded-xl p-5 ring-1 ring-gray-100 shadow-sm text-center">
									先行アクセス
								</li>
								<li className="bg-white rounded-xl p-5 ring-1 ring-gray-100 shadow-sm text-center">
									初年度○%OFF（先着◯名）
								</li>
								<li className="bg-white rounded-xl p-5 ring-1 ring-gray-100 shadow-sm text-center">
									オンボーディング優先
								</li>
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

				{/* 社会的証明 */}
				<section aria-labelledby="trust" className="py-10 md:py-12 bg-white">
					<h2 id="trust" className="sr-only">
						導入実績
					</h2>
					<div className="container mx-auto px-4">
						<p className="text-center text-gray-500 text-sm">
							全国の牧場・肥育農家・繁殖農家でご利用予定です
						</p>
						{/* <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center opacity-80">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={`logo-${i + 1}`} className="h-8 relative">
									<Image
										src={`/logos/logo-${i + 1}.svg`}
										alt="事業者ロゴ"
										fill
										className="object-contain"
										loading="lazy"
									/>
								</div>
							))}
						</div> */}
					</div>
				</section>

				{/* 成果ドリブンの特徴 */}
				<section id="features" className="py-16 md:py-20 bg-gray-50">
					<div className="container mx-auto px-4">
						<h2 className="text-2xl md:text-3xl font-bold text-center">
							すべての管理を、成果につなげる
						</h2>
						<p className="mt-3 text-center text-gray-600">
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
							].map((f) => (
								<div
									key={f.title}
									className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow"
								>
									<div className="text-3xl" aria-hidden>
										{f.icon}
									</div>
									<h3 className="mt-3 font-semibold text-lg">{f.title}</h3>
									<p className="mt-2 text-gray-600 text-sm">{f.desc}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ケース & 証言 */}
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
										{/* <div className="relative w-10 h-10 rounded-full overflow-hidden">
											<Image
												src={`/avatars/farmer-${i}.jpg`}
												alt="ユーザー"
												fill
												className="object-cover"
												loading="lazy"
											/>
										</div> */}
										<div>
											<div className="text-sm font-semibold">
												牧場オーナー Aさん
											</div>
											<div className="text-xs text-gray-500">
												繁殖牛 120頭規模
											</div>
										</div>
									</figcaption>
								</figure>
							))}
						</div>
					</div>
				</section>

				{/* 料金ティーザー */}
				<section id="pricing" className="py-16 md:py-20 bg-gray-50">
					<div className="container mx-auto px-4">
						<h2 className="text-2xl md:text-3xl font-bold text-center">
							料金（ローンチ時に公開）
						</h2>
						<p className="mt-2 text-center text-gray-600">
							いまはプレリリース。デモで体験し、事前登録で最新情報を受け取れます。
						</p>
						<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
							{[
								{
									name: "フリーデモ",
									price: "無料",
									features: [
										"ログイン不要",
										"主要機能を体験",
										"フィードバック歓迎",
									],
								},
								{
									name: "アーリーアクセス",
									price: "事前登録者向け",
									features: ["正式版へ先行招待", "優先サポート", "特典適用"],
								},
								{
									name: "正式版",
									price: "近日公開",
									features: [
										"詳細はメールで案内",
										"柔軟な料金プラン",
										"契約縛りなし",
									],
								},
							].map((p) => (
								<div
									key={p.name}
									className={`rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 bg-white ${
										p.name === "アーリーアクセス"
											? "border-2 border-primary"
											: ""
									}`}
								>
									<div className="text-sm text-gray-500">{p.name}</div>
									<div className="mt-1 text-3xl font-extrabold">{p.price}</div>
									<ul className="mt-4 space-y-2 text-sm text-gray-700">
										{p.features.map((f) => (
											<li key={f} className="flex gap-2">
												<span aria-hidden>•</span>
												{f}
											</li>
										))}
									</ul>
									{p.name === "フリーデモ" && (
										<Link
											href="/login"
											className="mt-6 inline-flex justify-center items-center w-full px-4 py-2.5 rounded-full font-semibold bg-gray-900 text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
											data-cta={`pricing-${p.name}`}
										>
											デモで試す
										</Link>
									)}
									{p.name === "アーリーアクセス" && (
										<Link
											href="#waitlist"
											className="mt-6 inline-flex justify-center items-center w-full px-4 py-2.5 rounded-full font-semibold bg-primary text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
											data-cta={`pricing-${p.name}`}
										>
											事前登録する
										</Link>
									)}
									{p.name === "正式版" && (
										<button
											type="button"
											disabled
											className="mt-6 inline-flex justify-center items-center w-full px-4 py-2.5 rounded-full font-semibold bg-gray-200 text-gray-500"
										>
											近日公開
										</button>
									)}
								</div>
							))}
						</div>
					</div>
				</section>

				{/* FAQ */}
				<section id="faq" className="py-16 md:py-20 bg-white">
					<div className="container mx-auto px-4 max-w-3xl">
						<h2 className="text-2xl md:text-3xl font-bold text-center">
							よくある質問
						</h2>
						<div className="mt-8 divide-y divide-gray-200 border border-gray-200 rounded-2xl">
							{[
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
							].map((item) => (
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

				{/* 待機リスト（アンカー） */}
				<section id="waitlist" className="py-12 md:py-16 bg-blue-50">
					<div className="container mx-auto px-4 max-w-2xl">
						<div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-blue-100">
							<h2 className="text-xl md:text-2xl font-bold text-center">
								正式ローンチの先行案内を受け取る
							</h2>
							<p className="mt-2 text-center text-gray-600">
								メールを登録すると、先行アクセスや特典のご案内をお送りします。
							</p>
							<form
								onSubmit={handleLeadSubmit}
								className="mt-6 flex flex-col sm:flex-row gap-3"
							>
								<label htmlFor="waitlist-email" className="sr-only">
									メールアドレス
								</label>
								<input
									id="waitlist-email"
									type="email"
									required
									inputMode="email"
									placeholder="メールアドレス"
									className="flex-1 bg-white border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
								<button
									type="submit"
									className="inline-flex justify-center items-center bg-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
									data-cta="waitlist-submit"
								>
									登録する
								</button>
							</form>
							<p className="mt-2 text-xs text-gray-500 text-center">
								退会は1クリック。スパムは送りません。
							</p>
						</div>
					</div>
				</section>

				{/* 最終CTA */}
				<section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center">
					<div className="container mx-auto px-4">
						<h2 className="text-2xl md:text-3xl font-extrabold">
							新しい牛の個体管理を、今すぐ。
						</h2>
						<p className="mt-2 text-white/90">
							まずは <strong>デモで体験</strong>、次に <strong>事前登録</strong>{" "}
							で先行案内を。
						</p>
						<div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
							<Link
								href="/login"
								className="inline-flex items-center justify-center bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/70"
								data-cta="bottom-cta-demo"
							>
								デモを見る（約1分）
							</Link>
							<Link
								href="#waitlist"
								className="inline-flex items-center justify-center border-2 border-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/70"
								data-cta="bottom-cta-waitlist"
							>
								事前登録する（先行特典）
							</Link>
						</div>
					</div>
				</section>
			</main>

			{/* モバイル固定CTAバー */}
			<section
				className={`fixed inset-x-0 bottom-0 z-50 md:hidden transition-transform ${
					isStickyVisible ? "translate-y-0" : "translate-y-full"
				}`}
				aria-label="モバイル用アクションバー"
			>
				<div className="mx-3 mb-3 rounded-2xl shadow-lg bg-white ring-1 ring-gray-200 p-2">
					<div className="flex items-center gap-2">
						<Link
							href="/login"
							className="flex-1 px-4 py-3 rounded-xl border border-primary text-primary text-center font-semibold"
							data-cta="sticky-demo"
						>
							デモ
						</Link>
						<Link
							href="#waitlist"
							className="flex-1 px-4 py-3 rounded-xl bg-primary text-white text-center font-semibold"
							data-cta="sticky-waitlist"
						>
							事前登録
						</Link>
					</div>
				</div>
			</section>

			<footer className="bg-gray-950 text-gray-300">
				<div className="container mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
					<div>
						<div className="flex items-center gap-2">
							<Image
								src="/icon-horizontal.png"
								alt="ギュウリスト"
								width={96}
								height={96}
							/>
						</div>
						<p className="mt-3 text-gray-400">
							畜産管理をもっとスマートに。現場と経営をつなぐクラウド。
						</p>
					</div>
					{/* <div>
						<div className="font-semibold text-white">製品</div>
						<ul className="mt-3 space-y-2">
							<li>
								<Link href="#features" className="hover:text-white">
									機能
								</Link>
							</li>
							<li>
								<Link href="#pricing" className="hover:text-white">
									料金
								</Link>
							</li>
							<li>
								<Link href="#faq" className="hover:text-white">
									FAQ
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<div className="font-semibold text-white">リソース</div>
						<ul className="mt-3 space-y-2">
							<li>
								<Link href="/docs" className="hover:text-white">
									ドキュメント
								</Link>
							</li>
							<li>
								<Link href="/support" className="hover:text-white">
									サポート
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<div className="font-semibold text-white">会社</div>
						<ul className="mt-3 space-y-2">
							<li>
								<Link href="/about" className="hover:text-white">
									会社概要
								</Link>
							</li>
							<li>
								<Link href="/privacy" className="hover:text-white">
									プライバシー
								</Link>
							</li>
							<li>
								<Link href="/terms" className="hover:text-white">
									利用規約
								</Link>
							</li>
						</ul>
					</div> */}
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

			<style jsx global>{`
				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(8px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes fadeIn {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}
				.motion-safe\\:animate-\\[fadeInUp_600ms_ease_1\\] {
					animation: fadeInUp 600ms ease both;
				}
				.motion-safe\\:animate-\\[fadeIn_700ms_ease_1_100ms\\] {
					animation: fadeIn 700ms ease both 100ms;
				}
			`}</style>
		</>
	);
}
