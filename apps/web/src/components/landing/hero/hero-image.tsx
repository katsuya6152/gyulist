import Image from "next/image";

export function HeroImage() {
	return (
		<div className="relative animate-slide-up-delayed">
			<div className="relative aspect-[4/3] md:aspect-[5/4] w-full h-full rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden animate-float">
				<Image
					src="/app-shot.png"
					alt="ギュウリストの画面"
					className="object-contain"
					priority
					fill
				/>
			</div>
			<div
				className="absolute top-1/2 -left-8 w-4 h-4 bg-yellow-100 rounded-full opacity-30 animate-bounce-subtle"
				style={{ animationDelay: "2s" }}
			/>
		</div>
	);
}
