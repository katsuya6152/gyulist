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
						<picture>
							<source
								srcSet="/hero-bg-pc.webp 1x, /hero-bg-pc@2x.webp 2x"
								type="image/webp"
							/>
							<Image
								src="/hero-bg-pc.png"
								alt="牧場の風景"
								fill
								priority
								sizes="100vw"
								placeholder="blur"
								blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
								className="object-cover opacity-70"
							/>
						</picture>
					</div>
					<div className="md:hidden">
						<picture>
							<source
								srcSet="/hero-bg-sp.webp 1x, /hero-bg-sp@2x.webp 2x"
								type="image/webp"
							/>
							<Image
								src="/hero-bg-sp.png"
								alt="牧場の風景"
								fill
								priority
								sizes="100vw"
								placeholder="blur"
								blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
								className="object-cover opacity-70"
							/>
						</picture>
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
