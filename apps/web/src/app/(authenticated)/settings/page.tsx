import { Button } from "@/components/ui/button";
import Link from "next/link";

export const runtime = "edge";

export default async function SettingsPage() {
	return (
		<div className="p-6">
			settings
			<Button>
				<Link href="/cattle">戻る</Link>
			</Button>
		</div>
	);
}
