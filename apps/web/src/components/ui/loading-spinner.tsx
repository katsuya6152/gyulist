"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	text?: string;
	className?: string;
}

export function LoadingSpinner({
	size = "md",
	text = "読み込み中...",
	className = ""
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-8 w-8"
	};

	return (
		<div
			className={`flex flex-col items-center justify-center gap-3 ${className}`}
		>
			<motion.div
				animate={{ rotate: 360 }}
				transition={{
					duration: 1,
					repeat: Number.POSITIVE_INFINITY,
					ease: "linear"
				}}
			>
				<Loader2 className={`${sizeClasses[size]} text-primary`} />
			</motion.div>
			{text && (
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="text-sm text-muted-foreground"
				>
					{text}
				</motion.p>
			)}
		</div>
	);
}
