import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Clock, Calendar, Tag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
	title: string;
	description: string;
	url: string;
	publishedAt: string;
	readingTime?: {
		text: string;
		minutes: number;
	};
	category: string;
	tags?: string[];
	image?: string;
	featured?: boolean;
	className?: string;
}

export function ArticleCard({
	title,
	description,
	url,
	publishedAt,
	readingTime,
	category,
	tags,
	image,
	featured = false,
	className
}: ArticleCardProps) {
	return (
		<Link href={url} className="group" key={title}>
			<Card
				className={cn(
					"overflow-hidden transition-all duration-300 hover-lift bg-gradient-card",
					featured && "ring-2 ring-primary/20 bg-gradient-primary/5",
					className
				)}
			>
				{image && (
					<div className="aspect-video overflow-hidden">
						<img
							src={image}
							alt={title}
							className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					</div>
				)}
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
						<span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
							{category}
						</span>
						{featured && (
							<span className="bg-accent/20 text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
								注目
							</span>
						)}
					</div>
					<h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
						{title}
					</h3>
				</CardHeader>
				<CardContent className="pt-0">
					<p className="text-muted-foreground text-sm leading-relaxed mb-4">
						{description}
					</p>
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								<time dateTime={publishedAt}>
									{format(new Date(publishedAt), "yyyy年M月d日", {
										locale: ja
									})}
								</time>
							</div>
							{readingTime && (
								<div className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									<span>{readingTime.text}</span>
								</div>
							)}
						</div>
						{tags && tags.length > 0 && (
							<div className="flex items-center gap-1">
								<Tag className="h-3 w-3" />
								<span>{tags.slice(0, 2).join(", ")}</span>
								{tags.length > 2 && <span>...</span>}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
