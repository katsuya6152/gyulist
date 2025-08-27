import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbsProps {
	items: BreadcrumbItem[];
	className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
	return (
		<nav
			aria-label="パンくずリスト"
			className={cn("flex items-center space-x-1", className)}
		>
			<Link
				href="/"
				className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
			>
				<Home className="h-4 w-4" />
				<span className="sr-only">ホーム</span>
			</Link>

			{items.map((item, index) => (
				<div key={index} className="flex items-center space-x-1">
					<ChevronRight className="h-4 w-4 text-muted-foreground" />
					{item.href ? (
						<Link
							href={item.href}
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							{item.label}
						</Link>
					) : (
						<span className="text-sm text-foreground font-medium">
							{item.label}
						</span>
					)}
				</div>
			))}
		</nav>
	);
}
