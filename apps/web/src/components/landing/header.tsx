import Image from "next/image";
import Link from "next/link";

export function LandingHeader() {
	return (
		<header className="sticky top-0 z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-100">
			<div className="container mx-auto px-4 h-14 flex items-center justify-between">
				<Link
					href="/"
					className="flex items-center gap-2"
					aria-label="ギュウリスト ホームへ"
				>
					<picture>
						<source srcSet="/icon-horizontal.webp" type="image/webp" />
						<Image
							src="/icon-horizontal.png"
							alt="ギュウリスト"
							width={96}
							height={31}
							sizes="96px"
							priority
						/>
					</picture>
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
	);
}
