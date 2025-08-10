import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to
// use bindings during local development (when running the application with
// `next dev`). This function is only necessary during development and
// has no impact outside of that. For more information see:
// https://github.com/cloudflare/next-on-pages/blob/main/internal-packages/next-dev/README.md
setupDevPlatform().catch(console.error);

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// JavaScriptバンドルの最適化
	experimental: {
		// バンドル分割の最適化
		optimizePackageImports: [
			"@radix-ui/react-accordion",
			"@radix-ui/react-checkbox",
			"@radix-ui/react-dialog",
			"@radix-ui/react-dropdown-menu",
			"@radix-ui/react-label",
			"@radix-ui/react-popover",
			"@radix-ui/react-radio-group",
			"@radix-ui/react-select",
			"@radix-ui/react-separator",
			"@radix-ui/react-slot",
			"@radix-ui/react-tabs",
			"lucide-react",
			"date-fns",
			"embla-carousel-react",
		],
		// ツリーシェイキングの強化
		turbo: {
			rules: {
				"*.svg": {
					loaders: ["@svgr/webpack"],
					as: "*.js",
				},
			},
		},
	},
	// 圧縮の有効化
	compress: true,
	// SWCによる最適化
	swcMinify: true,
	// パフォーマンス最適化
	poweredByHeader: false,
	generateEtags: false,
};

export default nextConfig;
