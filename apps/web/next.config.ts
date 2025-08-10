import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
import type { NextConfig } from "next";

setupDevPlatform().catch(console.error);

const nextConfig: NextConfig = {
	experimental: {
		// CSSの最適化
		optimizeCss: true,
		// フォントの最適化
		optimizePackageImports: ["@next/font"],
	},
	// 圧縮の有効化
	compress: true,
	// パフォーマンス最適化
	poweredByHeader: false,
	generateEtags: false,
};

export default nextConfig;
