import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CattleNewPresentation() {
	return (
		<div className="p-6">
			cattle/new
			<Button>
				<Link href="/cattle">戻る</Link>
			</Button>
		</div>
	);
}
