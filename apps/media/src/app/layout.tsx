import type { Metadata } from "next";
import { Inter, Cherry_Bomb_One } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Analytics } from "@/lib/analytics";
import { WebsiteJsonLd } from "@/components/json-ld";
import "@/styles/globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-geist-sans"
});

const cherryBombOne = Cherry_Bomb_One({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-cherry-bomb"
});

export const metadata: Metadata = {
	title: {
		default: "ギュウリスト Media - 牛の管理・飼育情報メディア",
		template: "%s | ギュウリスト Media"
	},
	description:
		"牛の管理・飼育に関する最新情報をお届けします。効率的な牧場経営をサポートするギュウリストの公式メディアです。",
	keywords: ["牛", "畜産", "牧場", "管理", "飼育", "ギュウリスト"],
	authors: [{ name: "ギュウリスト編集部" }],
	creator: "ギュウリスト",
	publisher: "ギュウリスト",
	metadataBase: new URL(
		process.env.NODE_ENV === "production"
			? "https://media.gyulist.jp"
			: "http://localhost:3002"
	),
	openGraph: {
		type: "website",
		locale: "ja_JP",
		url: "https://media.gyulist.jp",
		siteName: "ギュウリスト Media",
		title: "ギュウリスト Media - 牛の管理・飼育情報メディア",
		description:
			"牛の管理・飼育に関する最新情報をお届けします。効率的な牧場経営をサポートするギュウリストの公式メディアです。",
		images: [
			{
				url: "/images/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "ギュウリスト Media"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "ギュウリスト Media - 牛の管理・飼育情報メディア",
		description: "牛の管理・飼育に関する最新情報をお届けします。",
		images: ["/images/og-image.jpg"]
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
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png"
	},
	manifest: "/site.webmanifest"
};

export default function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<head>
				<WebsiteJsonLd
					url="https://media.gyulist.jp"
					name="ギュウリスト Media"
					description="牛の管理・飼育に関する最新情報をお届けします。効率的な牧場経営をサポートするギュウリストの公式メディアです。"
				/>
			</head>
			<body className={`${inter.variable} ${cherryBombOne.variable} font-sans antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<div className="relative flex min-h-screen flex-col">
						<Header />
						<main className="flex-1">{children}</main>
						<Footer />
					</div>
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
