import { Button } from "@/components/ui/button";
import Link from "next/link";

export const runtime = "edge";

export default async function SchedulePage() {
	return (
		<div className="p-6">
			schedule
			<Button>
				<Link href="/cattle">一覧</Link>
			</Button>
		</div>
	);
}
