import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="container mx-auto py-16 text-center">
			<h2 className="text-2xl font-bold mb-4">
				牛の情報が見つかりませんでした
			</h2>
			<p className="text-info mb-8">
				指定されたIDの牛の情報が存在しないか、アクセス権限がありません。
			</p>
			<div className="flex justify-center gap-4">
				<Button asChild>
					<Link href="/">TOPに戻る</Link>
				</Button>
				<Button asChild>
					<Link href="/cattle">牛一覧に戻る</Link>
				</Button>
			</div>
		</div>
	);
}
