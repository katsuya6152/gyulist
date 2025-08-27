import { posts } from "#site/content";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CTASection } from "@/components/cta-section";
import type { Metadata } from "next";

interface CategoryPageProps {
	params: Promise<{
		category: string;
	}>;
}

async function getCategoryPosts(category: string) {
	const decodedCategory = decodeURIComponent(category);
	const categoryPosts = posts.filter(
		(post) => !post.draft && post.category === decodedCategory
	);

	return { posts: categoryPosts, categoryName: decodedCategory };
}

export async function generateMetadata({
	params
}: CategoryPageProps): Promise<Metadata> {
	const resolvedParams = await params;
	const { categoryName } = await getCategoryPosts(resolvedParams.category);

	return {
		title: `${categoryName}の記事一覧`,
		description: `${categoryName}に関する記事をご覧いただけます。`
	};
}

export async function generateStaticParams() {
	const publishedPosts = posts.filter((post) => !post.draft);
	const categories = Array.from(
		new Set(publishedPosts.map((post) => post.category))
	);

	return categories.map((category) => ({
		category: encodeURIComponent(category)
	}));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
	const resolvedParams = await params;
	const { posts, categoryName } = await getCategoryPosts(
		resolvedParams.category
	);

	if (posts.length === 0) {
		notFound();
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<Breadcrumbs
				items={[
					{ label: "カテゴリ一覧", href: "/categories" },
					{ label: categoryName }
				]}
				className="mb-8"
			/>

			<div className="mb-12">
				<h1 className="text-4xl font-bold text-foreground mb-4">
					{categoryName}の記事一覧
				</h1>
				<p className="text-lg text-muted-foreground">
					{categoryName}に関する記事を{posts.length}件掲載しています。
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
				{posts.map((post) => (
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
		</div>
	);
}
