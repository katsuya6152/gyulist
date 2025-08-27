import { posts } from "#site/content";
import { ArticleCard } from "@/components/article-card";
import { CTASection } from "@/components/cta-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, TrendingUp, BookOpen, Tag, Folder } from "lucide-react";

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
		<div className="min-h-screen">
			{/* ヒーローセクション */}
			<section className="relative text-center py-24 mb-20 overflow-hidden">
				{/* 背景グラデーション */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
				
				{/* 装飾的な背景要素 */}
				<div className="absolute inset-0">
					{/* 左上の装飾 */}
					<div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
					<div className="absolute top-20 left-20 w-16 h-16 bg-primary/20 rounded-full blur-2xl" />
					
					{/* 右上の装飾 */}
					<div className="absolute top-16 right-16 w-24 h-24 bg-primary/15 rounded-full blur-3xl" />
					<div className="absolute top-8 right-8 w-12 h-12 bg-primary/25 rounded-full blur-2xl" />
					
					{/* 左下の装飾 */}
					<div className="absolute bottom-16 left-16 w-20 h-20 bg-primary/10 rounded-full blur-3xl" />
					
					{/* 右下の装飾 */}
					<div className="absolute bottom-20 right-20 w-28 h-28 bg-primary/15 rounded-full blur-3xl" />
					
					{/* 中央の装飾 */}
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
				</div>
				
				{/* グリッドパターン */}
				<div className="absolute inset-0 opacity-5">
					<div className="absolute inset-0" style={{
						backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
						backgroundSize: '40px 40px'
					}} />
				</div>
				
				{/* コンテンツ */}
				<div className="relative max-w-4xl mx-auto px-4">					
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
						牛の管理・飼育を
						<span className="text-primary block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
							もっと効率的に
						</span>
					</h1>
					<p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
						ギュウリスト
						メディアでは、牛の管理・飼育に関する最新情報や実践的なノウハウを発信しています。
						効率的な牧場経営を目指す皆様をサポートします。
					</p>
					
					{/* 統計情報 */}
					<div className="flex flex-wrap justify-center gap-8 mb-8 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<BookOpen className="h-5 w-5 text-primary" />
							<span className="text-2xl font-bold text-primary">{publishedPosts.length}</span>
							<span>記事</span>
						</div>
						<div className="flex items-center gap-2">
							<Tag className="h-5 w-5 text-primary" />
							<span className="text-2xl font-bold text-primary">
								{Array.from(new Set(publishedPosts.flatMap(post => post.tags || []))).length}
							</span>
							<span>タグ</span>
						</div>
						<div className="flex items-center gap-2">
							<Folder className="h-5 w-5 text-primary" />
							<span className="text-2xl font-bold text-primary">
								{Array.from(new Set(publishedPosts.map(post => post.category))).length}
							</span>
							<span>カテゴリ</span>
						</div>
					</div>
					
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300">
							<Link href="/posts">
								記事一覧を見る
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
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

			{/* メインコンテンツ */}
			<div className="container mx-auto px-4 space-y-20">
				{/* 注目記事セクション */}
				{featuredPosts.length > 0 && (
					<section>
						<div className="flex items-center gap-3 mb-8">
							<div className="p-2 bg-primary/10 rounded-lg">
								<TrendingUp className="h-6 w-6 text-primary" />
							</div>
							<h2 className="text-3xl font-bold text-foreground">注目記事</h2>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
				<section>
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<BookOpen className="h-6 w-6 text-primary" />
							</div>
							<h2 className="text-3xl font-bold text-foreground">最新記事</h2>
						</div>
						<Button asChild variant="outline" className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-300">
							<Link href="/posts">
								すべて見る
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
		</div>
	);
}
