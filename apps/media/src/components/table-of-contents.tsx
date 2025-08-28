"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface TableOfContentsProps {
	className?: string;
}

interface HeadingItem {
	id: string;
	text: string;
	level: number;
}

export function TableOfContents({ className }: TableOfContentsProps) {
	const [headings, setHeadings] = useState<HeadingItem[]>([]);
	const [activeId, setActiveId] = useState<string>("");

	useEffect(() => {
		// 記事内のh2, h3要素を取得
		const headings = Array.from(document.querySelectorAll("h2, h3"));
		
		const existingIds = new Set<string>();
		const articleHeadings: HeadingItem[] = [];

		headings.forEach((heading, index) => {
			const text = heading.textContent || "";
			let id = heading.id || text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
			
			// 空のIDやテキストをフィルタリング
			if (!text.trim() || !id.trim()) {
				return;
			}
			
			// 重複するIDを避けるために、必要に応じてインデックスを追加
			let finalId = id;
			let counter = 1;
			while (existingIds.has(finalId)) {
				finalId = `${id}-${counter}`;
				counter++;
			}
			existingIds.add(finalId);
			
			// IDが存在しない場合は、見出しにIDを設定
			if (!heading.id && finalId) {
				heading.id = finalId;
			}
			
			articleHeadings.push({
				id: finalId,
				text: text,
				level: parseInt(heading.tagName.charAt(1))
			});
		});

		setHeadings(articleHeadings);

		// Intersection Observerでアクティブな見出しを追跡
		const observer = new IntersectionObserver(
			(entries) => {
				// 現在表示されている見出しを追跡
				const visibleHeadings = entries
					.filter(entry => entry.isIntersecting)
					.map(entry => ({
						id: entry.target.id,
						top: entry.boundingClientRect.top
					}))
					.sort((a, b) => a.top - b.top);

				// ヘッダーの高さ分を考慮した閾値（ヘッダーは64px）
				const headerHeight = 64;
				const threshold = headerHeight + 50; // ヘッダーの下50px以内
				const topVisibleHeading = visibleHeadings.find(heading => heading.top > threshold);

				if (topVisibleHeading) {
					setActiveId(topVisibleHeading.id);
				} else if (visibleHeadings.length > 0) {
					// 閾値内にない場合は、最も上にある見出しを選択
					setActiveId(visibleHeadings[0].id);
				}
			},
			{
				rootMargin: `-${64 + 50}px 0px -10% 0px`, // ヘッダーの高さ + 50pxのオフセット
				threshold: [0, 0.1, 0.5, 1.0]
			}
		);

		articleHeadings.forEach((heading) => {
			if (heading.id) {
				const element = document.getElementById(heading.id);
				if (element) {
					observer.observe(element);
				}
			}
		});

		return () => observer.disconnect();
	}, []);

	const scrollToHeading = (id: string) => {
		if (!id) return;
		
		const element = document.getElementById(id);
		if (element) {
			// ヘッダーの高さ分だけオフセットを調整（ヘッダーは64px = 4rem）
			const headerHeight = 72;
			const elementTop = element.offsetTop - headerHeight;
			
			window.scrollTo({
				top: elementTop,
				behavior: "smooth"
			});
		}
	};

	if (headings.length === 0) {
		return null;
	}

	return (
		<nav className={cn("space-y-2", className)}>
			<h4 className="font-semibold text-sm text-muted-foreground mb-3">目次</h4>
			<ul className="space-y-1">
				{headings.map((heading, index) => {
					const isActive = activeId === heading.id;
					
					return (
						<li key={heading.id || `heading-${index}`}>
							<button
								onClick={() => scrollToHeading(heading.id)}
								className={cn(
									"flex items-center gap-2 w-full text-left px-2 py-1 rounded-md text-sm transition-colors hover:bg-muted/50",
									heading.level === 2 ? "font-medium" : "font-normal ml-4",
									isActive
										? "text-primary bg-primary/10"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								<ChevronRight className="h-3 w-3 flex-shrink-0" />
								<span className="truncate">{heading.text}</span>
							</button>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
