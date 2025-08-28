import { posts } from "#site/content";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ShareButtons } from "@/components/share-buttons";
import { CTASection } from "@/components/cta-section";
import { TableOfContents } from "@/components/table-of-contents";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";
import { Calendar, Clock, Tag, User } from "lucide-react";
import type { Metadata } from "next";

interface PostPageProps {
	params: Promise<{
		slug: string;
	}>;
}

async function getPostFromParams(params: { slug: string }) {
	const post = posts.find((post) => post.slugAsParams === params.slug);

	if (!post || post.draft) {
		return null;
	}

	return post;
}

export async function generateMetadata({
	params
}: PostPageProps): Promise<Metadata> {
	const resolvedParams = await params;
	const post = await getPostFromParams(resolvedParams);

	if (!post) {
		return {};
	}

	const url = `https://media.gyulist.jp/posts/${post.slug}`;

	return {
		title: post.title,
		description: post.description,
		authors: [{ name: post.author || "Gyulist編集部" }],
		openGraph: {
			title: post.title,
			description: post.description,
			type: "article",
			publishedTime: post.publishedAt,
			modifiedTime: post.updatedAt || post.publishedAt,
			url,
			images: post.image ? [{ url: post.image }] : [],
			authors: [post.author || "Gyulist編集部"]
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description: post.description,
			images: post.image ? [post.image] : []
		},
		alternates: {
			canonical: url
		}
	};
}

export async function generateStaticParams() {
	return posts
		.filter((post) => !post.draft)
		.map((post) => ({
			slug: post.slugAsParams
		}));
}

export default async function PostPage({ params }: PostPageProps) {
	const resolvedParams = await params;
	const post = await getPostFromParams(resolvedParams);

	if (!post) {
		notFound();
	}

	// MDXコンテンツは後で表示
	const url = `https://media.gyulist.jp${post.url}`;

	return (
		<>
			<ArticleJsonLd
				title={post.title}
				description={post.description}
				url={url}
				publishedAt={post.publishedAt}
				updatedAt={post.updatedAt}
				author={post.author || "Gyulist編集部"}
				category={post.category}
				tags={post.tags}
				image={post.image}
			/>
			<BreadcrumbJsonLd
				items={[
					{ name: "ホーム", url: "https://media.gyulist.jp" },
					{ name: "記事一覧", url: "https://media.gyulist.jp/posts" },
					{ name: post.title }
				]}
			/>
			<article className="container mx-auto px-4 py-8">
				<Breadcrumbs
					items={[{ label: "記事一覧", href: "/posts" }, { label: post.title }]}
					className="mb-8"
				/>

				{/* 記事ヘッダー */}
				<header className="mb-12">
					{post.image && (
						<div className="aspect-video overflow-hidden rounded-lg mb-8">
							<img
								src={post.image}
								alt={post.title}
								className="h-full w-full object-cover"
							/>
						</div>
					)}

					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
								{post.category}
							</span>
							{post.featured && (
								<span className="bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
									注目
								</span>
							)}
						</div>

						<h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
							{post.title}
						</h1>

						<p className="text-xl text-muted-foreground mb-8 leading-relaxed">
							{post.description}
						</p>

						<div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
							<div className="flex items-center gap-1">
								<User className="h-4 w-4" />
								<span>{post.author || "Gyulist編集部"}</span>
							</div>
							<div className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								<time dateTime={post.publishedAt}>
									{format(new Date(post.publishedAt), "yyyy年M月d日", {
										locale: ja
									})}
								</time>
							</div>
							{post.updatedAt && post.updatedAt !== post.publishedAt && (
								<div className="flex items-center gap-1">
									<span>更新:</span>
									<time dateTime={post.updatedAt}>
										{format(new Date(post.updatedAt), "yyyy年M月d日", {
											locale: ja
										})}
									</time>
								</div>
							)}
							{post.readingTime && (
								<div className="flex items-center gap-1">
									<Clock className="h-4 w-4" />
									<span>{post.readingTime.text}</span>
								</div>
							)}
						</div>

						{post.tags && post.tags.length > 0 && (
							<div className="flex items-center gap-2 mb-8">
								<Tag className="h-4 w-4 text-muted-foreground" />
								<div className="flex flex-wrap gap-2">
									{post.tags.map((tag) => (
										<span
											key={tag}
											className="bg-muted/50 text-muted-foreground px-2 py-1 rounded-md text-xs"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						)}

						<ShareButtons
							url={url}
							title={post.title}
							description={post.description}
							className="mb-8"
						/>
					</div>
				</header>

				{/* 記事コンテンツ */}
				<div className="max-w-4xl mx-auto">
					{/* 目次 */}
					<div className="mb-8">
						<TableOfContents className="bg-muted/30 rounded-lg p-4" />
					</div>
					
					{/* メインコンテンツ */}
					<div
						className="article-content max-w-none"
						dangerouslySetInnerHTML={{ __html: post.content }}
					/>
				</div>

				{/* 記事フッター */}
				<footer className="mt-12 pt-8 border-t">
					<ShareButtons
						url={url}
						title={post.title}
						description={post.description}
						className="mb-8"
					/>

					<CTASection />
				</footer>
			</article>
		</>
	);
}
