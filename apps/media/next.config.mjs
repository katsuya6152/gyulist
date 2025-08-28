/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ["images.unsplash.com", "gyulist.jp"],
		unoptimized: true
	},
	// Cloudflare Pages対応
	output: "export",
	trailingSlash: true
};

export default nextConfig;
