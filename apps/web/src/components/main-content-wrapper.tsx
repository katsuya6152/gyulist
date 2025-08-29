"use client";

import { useSidebar } from "@/components/sidebar-provider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ReactNode } from "react";

interface MainContentWrapperProps {
	children: ReactNode;
	useSidebarLayout?: boolean;
}

export function MainContentWrapper({
	children,
	useSidebarLayout = true
}: MainContentWrapperProps) {
	const isDesktop = useMediaQuery("(min-width: 1024px)");

	// サイドバーレイアウトを使用しない場合
	if (!useSidebarLayout) {
		return <div className="w-full">{children}</div>;
	}

	// サイドバーレイアウトを使用する場合
	const { isExpanded } = useSidebar();

	if (!isDesktop) {
		return <div className="w-full">{children}</div>;
	}

	return (
		<div
			className={`transition-all duration-300 ease-in-out ${
				isExpanded ? "lg:pl-64" : "lg:pl-16"
			}`}
		>
			{children}
		</div>
	);
}
