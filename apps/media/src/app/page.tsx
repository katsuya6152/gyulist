import { posts } from "#site/content";
import { ArticleCard } from "@/components/article-card";
import { CTASection } from "@/components/cta-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

export default function HomePage() {
	// 公開済み記事をフィルタリング
	const publishedPosts = posts.filter((post) => !post.draft);

	// 注目記事と最新記事を分ける（重複を避ける）
	const featuredPosts = publishedPosts
		.filter((post) => post.featured)
		.slice(0, 3);
	const latestPosts = publishedPosts
		.filter((post) => !post.featured) // 注目記事以外を取得
		.slice(0, 6);

	return (
		<div className="container mx-auto px-4 py-8">
			{/* ヒーローセクション */}
			<section className="text-center py-12 mb-16">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
						牛の管理・飼育を
						<span className="text-primary block">もっと効率的に</span>
					</h1>
					<p className="text-xl text-muted-foreground mb-8 leading-relaxed">
						ギュウリスト
						Mediaでは、牛の管理・飼育に関する最新情報や実践的なノウハウを発信しています。
						効率的な牧場経営を目指す皆様をサポートします。
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button asChild size="lg">
							<Link href="/posts">
								記事一覧を見る
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link
								href="https://gyulist.com"
								target="_blank"
								rel="noopener noreferrer"
							>
								ギュウリストについて
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* 注目記事セクション */}
			{featuredPosts.length > 0 && (
				<section className="mb-16">
					<div className="flex items-center gap-2 mb-8">
						<TrendingUp className="h-6 w-6 text-primary" />
						<h2 className="text-3xl font-bold text-foreground">注目記事</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{featuredPosts.map((post) => (
							<ArticleCard
								key={`featured-${post.slug}`}
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
				</section>
			)}

			{/* 最新記事セクション */}
			<section className="mb-16">
				<div className="flex items-center justify-between mb-8">
					<h2 className="text-3xl font-bold text-foreground">最新記事</h2>
					<Button asChild variant="outline">
						<Link href="/posts">
							すべて見る
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{latestPosts.map((post) => (
						<ArticleCard
							key={`latest-${post.slug}`}
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
			</section>

			{/* CTAセクション */}
			<section>
				<CTASection />
			</section>
		</div>
	);
}
