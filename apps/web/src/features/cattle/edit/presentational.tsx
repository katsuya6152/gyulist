import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CattleEditPresentation() {
	return (
		<div className="p-6">
			cattle/[id]/edit
			<Button>
				<Link href="/cattle">戻る</Link>
			</Button>
		</div>
	);
}
