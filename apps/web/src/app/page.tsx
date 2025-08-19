import { CasesSection } from "@/components/landing/cases-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { WaitlistSection } from "@/components/landing/waitlist-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title:
		"ギュウリスト - 畜産経営をデータで支える | 個体・繁殖・健康管理システム",
	description:
		"畜産経営の効率化を実現するクラウド型管理アプリ。個体管理、繁殖管理、健康管理を一元化し、データで牧場経営をサポート。無料デモ体験受付中。",
	keywords: [
		"畜産管理",
		"個体管理",
		"繁殖管理",
		"健康管理",
		"アプリ無料",
		"無料アプリ",
		"牧場経営",
		"データ管理",
		"畜産システム",
		"酪農管理",
		"肉牛管理",
		"繁殖成績",
		"個体識別",
		"生産性向上",
		"クラウド管理",
		"畜産アプリ"
	],
	openGraph: {
		title: "ギュウリスト - 畜産経営をデータで支える",
		description:
			"個体・繁殖・健康のデータを一元管理。紙とExcelから卒業し、効率的な牧場経営を実現します。",
		type: "website",
		locale: "ja_JP",
		siteName: "ギュウリスト",
		images: [
			{
				url: "/app-shot.webp",
				width: 1200,
				height: 630,
				alt: "ギュウリスト アプリケーション画面"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "ギュウリスト - 畜産経営をデータで支える",
		description:
			"個体・繁殖・健康のデータを一元管理。効率的な牧場経営を実現します。",
		images: ["/app-shot.webp"]
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1
		}
	},
	alternates: {
		canonical: "https://gyulist.com"
	},
	other: {
		"application/ld+json": JSON.stringify([
			{
				"@context": "https://schema.org",
				"@type": "SoftwareApplication",
				name: "ギュウリスト",
				applicationCategory: "BusinessApplication",
				operatingSystem: "Web",
				description: "畜産経営の効率化を実現するクラウド型管理アプリ",
				url: "https://gyulist.com",
				offers: {
					"@type": "Offer",
					price: "0",
					priceCurrency: "JPY",
					availability: "https://schema.org/InStock"
				},
				releaseNotes: "Pre-release: Demo available / Waitlist open"
			},
			{
				"@context": "https://schema.org",
				"@type": "Organization",
				name: "ギュウリスト",
				url: "https://gyulist.com",
				logo: "https://gyulist.com/icon.svg",
				description: "畜産経営をデータで支えるクラウド型管理アプリ",
				sameAs: [
					// ソーシャルメディアアカウントがあれば追加
				]
			},
			{
				"@context": "https://schema.org",
				"@type": "WebSite",
				name: "ギュウリスト",
				url: "https://gyulist.com",
				description: "畜産経営の効率化を実現するクラウド型管理アプリ",
				publisher: {
					"@type": "Organization",
					name: "ギュウリスト"
				}
			}
		])
	}
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
				fetchPriority="high"
			/>
			<link
				rel="preload"
				href="/hero-bg-sp.webp"
				as="image"
				type="image/webp"
				fetchPriority="high"
			/>
			<link
				rel="preload"
				href="/app-shot.webp"
				as="image"
				type="image/webp"
				fetchPriority="high"
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
