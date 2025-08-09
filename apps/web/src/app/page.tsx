import { CasesSection } from "@/components/landing/cases-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { WaitlistSection } from "@/components/landing/waitlist-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "ギュウリスト - 畜産経営をデータで支える",
	description:
		"個体・繁殖・健康のデータを一元管理。紙とExcelから卒業し、効率的な牧場経営を実現します。",
	keywords: [
		"畜産管理",
		"個体管理",
		"繁殖管理",
		"健康管理",
		"牧場経営",
		"データ管理",
	],
	openGraph: {
		title: "ギュウリスト - 畜産経営をデータで支える",
		description:
			"個体・繁殖・健康のデータを一元管理。紙とExcelから卒業し、効率的な牧場経営を実現します。",
		type: "website",
	},
	other: {
		"application/ld+json": JSON.stringify({
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "ギュウリスト",
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
			releaseNotes: "Pre-release: Demo available / Waitlist open",
		}),
	},
};

/**
 * 主要CV：①デモ体験 ②事前登録（Waitlist）
 */
export default function Home() {
	return (
		<>
			{/* 重要な画像のプリロード */}
			<link
				rel="preload"
				href="/hero-bg-pc.webp"
				as="image"
				type="image/webp"
			/>
			<link
				rel="preload"
				href="/hero-bg-sp.webp"
				as="image"
				type="image/webp"
			/>
			<link rel="preload" href="/app-shot.webp" as="image" type="image/webp" />
			<link
				rel="preload"
				href="/icon-horizontal.webp"
				as="image"
				type="image/webp"
			/>

			<LandingHeader />

			<main>
				<HeroSection />
				<FeaturesSection />
				<CasesSection />
				<PricingSection />
				<WaitlistSection />
			</main>

			<LandingFooter />
		</>
	);
}
