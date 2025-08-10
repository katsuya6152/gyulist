import dynamic from "next/dynamic";
import Image from "next/image";

// 動的インポートで遅延読み込み
const HeroContent = dynamic(
	() =>
		import("./hero/hero-content").then((mod) => ({ default: mod.HeroContent })),
	{
		loading: () => (
			<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
		),
		ssr: true,
	},
);

const HeroImage = dynamic(
	() => import("./hero/hero-image").then((mod) => ({ default: mod.HeroImage })),
	{
		loading: () => (
			<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
		),
		ssr: true,
	},
);

const PerksSection = dynamic(
	() =>
		import("./hero/perks-section").then((mod) => ({
			default: mod.PerksSection,
		})),
	{
		loading: () => (
			<div className="animate-pulse bg-gray-200 h-32 rounded-lg" />
		),
		ssr: true,
	},
);

const TrustSection = dynamic(
	() =>
		import("./hero/trust-section").then((mod) => ({
			default: mod.TrustSection,
		})),
	{
		loading: () => (
			<div className="animate-pulse bg-gray-200 h-32 rounded-lg" />
		),
		ssr: true,
	},
);

export function HeroSection() {
	return (
		<>
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 -z-10">
					<picture>
						<source
							media="(min-width: 768px)"
							srcSet="/hero-bg-pc.webp 1x"
							type="image/webp"
						/>
						<source
							media="(max-width: 767px)"
							srcSet="/hero-bg-sp.webp 1x"
							type="image/webp"
						/>
						<Image
							src="/hero-bg-pc.png"
							alt="牧場の風景"
							fill
							priority
							fetchPriority="high"
							className="object-cover opacity-70"
						/>
					</picture>
					<div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/70 to-white" />
				</div>

				<div className="container mx-auto px-4 pt-14 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-[1.1fr_0.9fr] items-center gap-10">
					<HeroContent />
					<HeroImage />
				</div>
			</section>

			<PerksSection />
			<TrustSection />
		</>
	);
}
