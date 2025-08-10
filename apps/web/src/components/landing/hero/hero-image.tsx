import Image from "next/image";

export function HeroImage() {
	return (
		<div className="relative">
			<div className="relative aspect-[4/3] md:aspect-[5/4] w-full h-full rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden animate-float">
				<picture>
					<source srcSet="/app-shot.webp" type="image/webp" />
					<Image
						src="/app-shot.png"
						alt="ギュウリストの画面"
						className="object-contain"
						priority
						fetchPriority="high"
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</picture>
			</div>
			<div
				className="absolute top-1/2 -left-8 w-4 h-4 bg-yellow-100 rounded-full opacity-30 animate-bounce-subtle"
				style={{ animationDelay: "2s" }}
			/>
		</div>
	);
}
