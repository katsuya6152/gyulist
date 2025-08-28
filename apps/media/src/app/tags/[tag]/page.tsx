import { posts } from "#site/content";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import type { Metadata } from "next";

interface TagPageProps {
	params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
	// 公開済み記事をフィルタリング
	const publishedPosts = posts.filter((post) => !post.draft);

	// すべてのタグを収集
	const allTags = publishedPosts
		.flatMap((post) => post.tags || [])
		.filter((tag) => tag && tag.trim() !== "");

	// 重複を除去
	const uniqueTags = [...new Set(allTags)];

	// 各タグのパラメータを生成
	return uniqueTags.map((tag) => ({
		tag: encodeURIComponent(tag)
	}));
}

export async function generateMetadata({
	params
}: TagPageProps): Promise<Metadata> {
	const { tag } = await params;
	const decodedTag = decodeURIComponent(tag);

	return {
		title: `タグ: ${decodedTag} | ギュウリスト Media`,
		description: `${decodedTag}に関する記事一覧です。牛の管理・飼育に関する情報をお届けします。`
	};
}

export default async function TagPage({ params }: TagPageProps) {
	const { tag } = await params;
	const decodedTag = decodeURIComponent(tag);

	// 公開済み記事をフィルタリング
	const publishedPosts = posts.filter((post) => !post.draft);

	// 指定されたタグを持つ記事をフィルタリング
	const taggedPosts = publishedPosts.filter((post) =>
		post.tags?.includes(decodedTag)
	);

	// すべてのタグを収集（サイドバー用）
	const allTags = publishedPosts
		.flatMap((post) => post.tags || [])
		.filter((tag) => tag && tag.trim() !== "");

	const tagCounts = allTags.reduce(
		(acc, tag) => {
			acc[tag] = (acc[tag] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const sortedTags = Object.entries(tagCounts)
		.sort(([, a], [, b]) => b - a)
		.map(([tag]) => tag);

	return (
		<div className="container mx-auto px-4 py-8">
			{/* ヘッダー */}
			<div className="mb-8">
				<Button asChild variant="ghost" className="mb-4">
					<Link href="/tags">
						<ArrowLeft className="h-4 w-4 mr-2" />
						タグ一覧に戻る
					</Link>
				</Button>
				<div className="flex items-center gap-3 mb-4">
					<Tag className="h-8 w-8 text-primary" />
					<h1 className="text-3xl md:text-4xl font-bold text-foreground">
						タグ: {decodedTag}
					</h1>
				</div>
				<p className="text-muted-foreground">
					{taggedPosts.length}件の記事が見つかりました
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* メインコンテンツ */}
				<div className="lg:col-span-3">
					{taggedPosts.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{taggedPosts.map((post) => (
								<ArticleCard
									key={post.slug}
									title={post.title}
									description={post.description}
									url={post.url}
									publishedAt={post.publishedAt}
									readingTime={post.readingTime}
									category={post.category}
									tags={post.tags}
									image={post.image}
									featured={post.featured}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h2 className="text-2xl font-semibold text-foreground mb-2">
								記事が見つかりません
							</h2>
							<p className="text-muted-foreground mb-6">
								このタグに関連する記事は現在ありません。
							</p>
							<Button asChild>
								<Link href="/posts">記事一覧を見る</Link>
							</Button>
						</div>
					)}
				</div>

				{/* サイドバー */}
				<div className="lg:col-span-1">
					<div className="sticky top-8">
						<div className="bg-card border border-border rounded-lg p-6">
							<h3 className="text-lg font-semibold text-foreground mb-4">
								他のタグ
							</h3>
							<div className="space-y-2">
								{sortedTags
									.filter((t) => t !== decodedTag)
									.slice(0, 10)
									.map((tag) => (
										<Link
											key={tag}
											href={`/tags/${encodeURIComponent(tag)}`}
											className="block text-sm text-muted-foreground hover:text-primary transition-colors"
										>
											{tag} ({tagCounts[tag]})
										</Link>
									))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
