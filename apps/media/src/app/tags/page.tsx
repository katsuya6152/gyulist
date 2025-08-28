import { posts } from "#site/content";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tag } from "lucide-react";

export const metadata = {
	title: "タグ一覧 | Gyulist Media",
	description: "牛の管理・飼育に関する記事のタグ一覧です。"
};

export default function TagsPage() {
	// 公開済み記事をフィルタリング
	const publishedPosts = posts.filter((post) => !post.draft);

	// すべてのタグを収集
	const allTags = publishedPosts
		.flatMap((post) => post.tags || [])
		.filter((tag) => tag && tag.trim() !== "");

	// タグの出現回数をカウント
	const tagCounts = allTags.reduce(
		(acc, tag) => {
			acc[tag] = (acc[tag] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	// タグを出現回数順にソート
	const sortedTags = Object.entries(tagCounts)
		.sort(([, a], [, b]) => b - a)
		.map(([tag]) => tag);

	return (
		<div className="container mx-auto px-4 py-8">
			{/* ヘッダー */}
			<div className="text-center mb-12">
				<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
					タグ一覧
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					牛の管理・飼育に関する記事をタグ別に分類しています。
					興味のあるタグをクリックして、関連記事を探してみてください。
				</p>
			</div>

			{/* タグ一覧 */}
			<div className="max-w-4xl mx-auto">
				{sortedTags.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{sortedTags.map((tag) => (
							<Link
								key={tag}
								href={`/tags/${encodeURIComponent(tag)}`}
								className="group"
							>
								<div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors group-hover:shadow-md">
									<div className="flex items-center gap-3 mb-3">
										<Tag className="h-5 w-5 text-primary" />
										<h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
											{tag}
										</h2>
									</div>
									<p className="text-muted-foreground">
										{tagCounts[tag]}件の記事
									</p>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h2 className="text-2xl font-semibold text-foreground mb-2">
							タグが見つかりません
						</h2>
						<p className="text-muted-foreground mb-6">
							現在、タグ付きの記事がありません。
						</p>
						<Button asChild>
							<Link href="/posts">記事一覧を見る</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
