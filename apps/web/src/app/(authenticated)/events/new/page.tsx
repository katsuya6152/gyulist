import { Button } from "@/components/ui/button";
import Link from "next/link";

export const runtime = "edge";

export default async function EventsNewPage() {
	return (
		<div className="p-6">
			events/new
			<Button>
				<Link href="/cattle">戻る</Link>
			</Button>
		</div>
	);
}
