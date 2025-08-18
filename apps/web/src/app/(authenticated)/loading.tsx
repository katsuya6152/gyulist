import { LoadingSpinner } from "@/components/ui/loading-spinner";
//

export default function Loading() {
	return (
		<div className="relative w-full h-screen">
			<div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
			<div className="absolute inset-0 flex items-center justify-center">
				<LoadingSpinner
					size="lg"
					text="ページを読み込み中..."
					className="p-8"
				/>
			</div>
		</div>
	);
}
