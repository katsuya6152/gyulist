import { posts } from "#site/content";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CTASection } from "@/components/cta-section";

export const metadata = {
	title: "記事一覧",
	description:
		"Gyulist Mediaの記事一覧ページです。牛の管理・飼育に関する情報をお探しください。"
};

export default function PostsPage() {
	const publishedPosts = posts.filter((post) => !post.draft);

	return (
		<div className="container mx-auto px-4 py-8">
			<Breadcrumbs items={[{ label: "記事一覧" }]} className="mb-8" />

			<div className="mb-12">
				<h1 className="text-4xl font-bold text-foreground mb-4">記事一覧</h1>
				<p className="text-lg text-muted-foreground">
					牛の管理・飼育に関する記事をご覧いただけます。
				</p>
			</div>

			{publishedPosts.length > 0 ? (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
						{publishedPosts.map((post) => (
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

					<CTASection />
				</>
			) : (
				<div className="text-center py-12">
					<p className="text-lg text-muted-foreground mb-8">
						現在、記事を準備中です。しばらくお待ちください。
					</p>
					<CTASection />
				</div>
			)}
		</div>
	);
}
