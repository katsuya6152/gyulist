import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap",
	preload: true,
	fallback: ["system-ui", "arial"]
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
	preload: true,
	fallback: ["monospace"]
});

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
		"データ管理"
	],
	openGraph: {
		title: "ギュウリスト - 畜産経営をデータで支える",
		description:
			"個体・繁殖・健康のデータを一元管理。紙とExcelから卒業し、効率的な牧場経営を実現します。",
		type: "website"
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
	}
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<head>
				{/* 重要なリソースのプリロード */}
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
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider defaultTheme="light">
					{children}
					<GoogleAnalytics gaId="G-BVT447BW6L" />
				</ThemeProvider>
			</body>
		</html>
	);
}
