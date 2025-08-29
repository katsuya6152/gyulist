import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export function SupportCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MessageSquare className="h-5 w-5" />
					サポート
				</CardTitle>
				<CardDescription>サポートとお問い合わせに関する設定</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<h3 className="font-medium">お問い合わせ</h3>
					<p className="text-sm text-muted-foreground">
						ご質問やご要望がございましたら、お気軽にお問い合わせください
					</p>
				</div>
				<Button variant="outline" asChild className="flex items-center gap-2">
					<Link href="/contact">
						<MessageSquare className="h-4 w-4" />
						お問い合わせ
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
