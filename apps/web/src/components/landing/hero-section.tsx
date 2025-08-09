import Image from "next/image";
import { HeroContent } from "./hero/hero-content";
import { HeroImage } from "./hero/hero-image";
import { PerksSection } from "./hero/perks-section";
import { TrustSection } from "./hero/trust-section";

export function HeroSection() {
	return (
		<>
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 -z-10">
					<div className="hidden md:block">
						<Image
							src="/hero-bg-pc.png"
							alt="牧場の風景"
							fill
							priority
							className="object-cover opacity-70"
						/>
					</div>
					<div className="md:hidden">
						<Image
							src="/hero-bg-sp.png"
							alt="牧場の風景"
							fill
							priority
							className="object-cover opacity-70"
						/>
					</div>
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
