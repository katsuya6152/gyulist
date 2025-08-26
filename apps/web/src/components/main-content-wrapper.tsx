"use client";

import { useSidebar } from "@/components/sidebar-provider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ReactNode } from "react";

interface MainContentWrapperProps {
	children: ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
	const { isExpanded } = useSidebar();
	const isDesktop = useMediaQuery("(min-width: 1024px)");

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
