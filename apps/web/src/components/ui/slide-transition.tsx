"use client";

import { type Variants, motion } from "framer-motion";
import type { ReactNode } from "react";

interface SlideTransitionProps {
	children: ReactNode;
	direction?: "left" | "right";
	className?: string;
}

export function SlideTransition({
	children,
	direction = "right",
	className = ""
}: SlideTransitionProps) {
	const variants: Variants = {
		initial: {
			x: direction === "right" ? "100%" : "-100%",
			opacity: 0
		},
		animate: {
			x: 0,
			opacity: 1,
			transition: {
				type: "spring",
				stiffness: 300,
				damping: 30
			}
		},
		exit: {
			x: direction === "right" ? "-100%" : "100%",
			opacity: 0,
			transition: {
				type: "spring",
				stiffness: 300,
				damping: 30
			}
		}
	};

	return (
		<motion.div
			variants={variants}
			initial="initial"
			animate="animate"
			exit="exit"
			className={className}
		>
			{children}
		</motion.div>
	);
}
