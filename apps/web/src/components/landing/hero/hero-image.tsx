import Image from "next/image";

export function HeroImage() {
	return (
		<div className="relative animate-slide-up-delayed">
			<div className="relative aspect-[4/3] md:aspect-[5/4] w-full h-full rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden animate-float">
				<picture>
					<source
						srcSet="/app-shot.webp 1x, /app-shot@2x.webp 2x"
						type="image/webp"
					/>
					<Image
						src="/app-shot.png"
						alt="ギュウリストの画面"
						className="object-contain"
						priority
						fill
						sizes="(max-width: 768px) 100vw, 50vw"
						placeholder="blur"
						blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
