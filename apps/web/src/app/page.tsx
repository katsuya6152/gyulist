import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen">
			{/* ヒーローセクション */}
			<section className="relative h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 animate-fade-in">
				<div className="absolute inset-0 z-0">
					<Image
						src="/hero-bg-pc.png"
						alt="牧場の風景"
						fill
						className="object-cover opacity-50 hidden md:block"
						priority
					/>
					<Image
						src="/hero-bg-sp.png"
						alt="牧場の風景"
						fill
						className="object-cover opacity-50 md:hidden"
						priority
					/>
				</div>
				<div className="relative z-10 text-center px-4 animate-fade-in-up">
					<h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-down">
						畜産管理を、もっとスマートに
					</h1>
					<p className="text-xl md:text-2xl text-gray-600 mb-8 animate-fade-in-up">
						牛の個体管理から繁殖管理まで、すべてを一元管理
					</p>
					<Link
						href="/login"
						className="inline-block bg-gradient-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 tap-feedback animate-bounce-in"
					>
						無料で始める
					</Link>
				</div>
			</section>

			{/* 特徴セクション */}
			<section className="py-20 bg-white animate-fade-in-up">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">
						すべての管理を、シンプルに
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						<div className="text-center p-6 animate-fade-in-up hover-lift transition-all duration-300">
							<div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 hover:shadow-lg transition-all duration-300">
								<svg
									className="w-8 h-8 text-blue-600 transition-transform duration-200 hover:scale-110"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>個体管理アイコン</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-2">個体管理</h3>
							<p className="text-gray-600">
								個体識別番号から健康状態まで、すべての情報を一元管理
							</p>
						</div>
						<div
							className="text-center p-6 animate-fade-in-up hover-lift transition-all duration-300"
							style={{ animationDelay: "0.1s" }}
						>
							<div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 hover:shadow-lg transition-all duration-300">
								<svg
									className="w-8 h-8 text-green-600 transition-transform duration-200 hover:scale-110"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>繁殖管理アイコン</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-2">繁殖管理</h3>
							<p className="text-gray-600">
								発情から分娩まで、繁殖サイクルを最適に管理
							</p>
						</div>
						<div
							className="text-center p-6 animate-fade-in-up hover-lift transition-all duration-300"
							style={{ animationDelay: "0.2s" }}
						>
							<div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 hover:shadow-lg transition-all duration-300">
								<svg
									className="w-8 h-8 text-purple-600 transition-transform duration-200 hover:scale-110"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>血統管理アイコン</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-2">血統管理</h3>
							<p className="text-gray-600">
								父牛、母牛の情報を簡単に管理し、血統を追跡
							</p>
						</div>
						<div
							className="text-center p-6 animate-fade-in-up hover-lift transition-all duration-300"
							style={{ animationDelay: "0.3s" }}
						>
							<div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 hover:shadow-lg transition-all duration-300">
								<svg
									className="w-8 h-8 text-red-600 transition-transform duration-200 hover:scale-110"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>健康管理アイコン</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-2">健康管理</h3>
							<p className="text-gray-600">
								ワクチン接種から削蹄まで、健康状態を記録
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* メリットセクション */}
			<section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in-up">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">
						なぜ、ギュウリストなのか
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="bg-gradient-card p-8 rounded-lg shadow-sm hover-lift transition-all duration-300 animate-fade-in-up">
							<h3 className="text-xl font-semibold mb-4">効率化</h3>
							<p className="text-gray-600">
								紙の記録や複数のシステムを使い分ける必要がなくなり、管理作業が効率化されます。
							</p>
						</div>
						<div
							className="bg-gradient-card p-8 rounded-lg shadow-sm hover-lift transition-all duration-300 animate-fade-in-up"
							style={{ animationDelay: "0.1s" }}
						>
							<h3 className="text-xl font-semibold mb-4">最適化</h3>
							<p className="text-gray-600">
								繁殖サイクルを最適に管理することで、生産性の向上につながります。
							</p>
						</div>
						<div
							className="bg-gradient-card p-8 rounded-lg shadow-sm hover-lift transition-all duration-300 animate-fade-in-up"
							style={{ animationDelay: "0.2s" }}
						>
							<h3 className="text-xl font-semibold mb-4">簡素化</h3>
							<p className="text-gray-600">
								複雑な血統管理も、シンプルな操作で簡単に記録できます。
							</p>
						</div>
						<div
							className="bg-gradient-card p-8 rounded-lg shadow-sm hover-lift transition-all duration-300 animate-fade-in-up"
							style={{ animationDelay: "0.3s" }}
						>
							<h3 className="text-xl font-semibold mb-4">一元化</h3>
							<p className="text-gray-600">
								すべての情報を一つのシステムで管理することで、情報の共有が容易になります。
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTAセクション */}
			<section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white animate-fade-in-up">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-8 animate-fade-in">
						新しい牛の個体管理を、今すぐ始めませんか？
					</h2>
					<div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
						<Link
							href="/login"
							className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 tap-feedback"
						>
							今すぐ始める
						</Link>
						<Link
							href="/features"
							className="inline-block border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-300 tap-feedback"
						>
							詳細を見る
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
