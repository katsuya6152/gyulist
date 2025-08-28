import { posts } from "#site/content";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CTASection } from "@/components/cta-section";
import { Folder } from "lucide-react";

export const metadata = {
	title: "カテゴリ一覧",
	description: "記事のカテゴリ別に分類された情報をご覧いただけます。"
};

export default function CategoriesPage() {
	// カテゴリごとの記事数を集計
	const publishedPosts = posts.filter((post) => !post.draft);
	const categoryCount = publishedPosts.reduce(
		(acc, post) => {
			const category = post.category;
			acc[category] = (acc[category] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const categories = Object.entries(categoryCount).sort(
		([, a], [, b]) => b - a
	);

	return (
		<div className="container mx-auto px-4 py-8">
			<Breadcrumbs items={[{ label: "カテゴリ一覧" }]} className="mb-8" />

			<div className="mb-12">
				<h1 className="text-4xl font-bold text-foreground mb-4">
					カテゴリ一覧
				</h1>
				<p className="text-lg text-muted-foreground">
					カテゴリ別に記事をお探しいただけます。
				</p>
			</div>

			{categories.length > 0 ? (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
						{categories.map(([category, count]) => (
							<Link
								key={category}
								href={`/categories/${encodeURIComponent(category)}`}
								className="group"
							>
								<Card className="h-full transition-all duration-300 hover-lift bg-gradient-card">
									<CardHeader>
										<div className="flex items-center space-x-3">
											<div className="p-2 bg-primary/10 rounded-lg">
												<Folder className="h-6 w-6 text-primary" />
											</div>
											<div className="flex-1">
												<CardTitle className="text-lg group-hover:text-primary transition-colors">
													{category}
												</CardTitle>
											</div>
											<Badge variant="secondary" className="ml-auto">
												{count}記事
											</Badge>
										</div>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground">
											{category}に関する記事を{count}件掲載しています。
										</p>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>

					<CTASection />
				</>
			) : (
				<div className="text-center py-12">
					<p className="text-lg text-muted-foreground mb-8">
						現在、カテゴリを準備中です。しばらくお待ちください。
					</p>
					<CTASection />
				</div>
			)}
		</div>
	);
}
