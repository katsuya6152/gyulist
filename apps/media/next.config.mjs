const isDev = process.argv.indexOf("dev") !== -1;
const isBuild = process.argv.indexOf("build") !== -1;
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
	process.env.VELITE_STARTED = "1";
	const { build } = await import("velite");
	await build({ watch: isDev, clean: !isBuild });
}

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
