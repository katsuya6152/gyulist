"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CloseButtonProps {
	className?: string;
}

export function CloseButton({ className = "" }: CloseButtonProps) {
	const router = useRouter();

	const handleClose = () => {
		// ローカルストレージから保存されたURLを取得
		const savedUrl = localStorage.getItem("cattleListUrl");
		if (savedUrl) {
			// 保存されたURLに遷移
			router.push(savedUrl);
		} else {
			// 保存されたURLがない場合は通常のブラウザバック
			router.back();
		}
	};

	return (
		<button
			type="button"
			onClick={handleClose}
			className={`p-2 rounded-ful hover:bg-gray-200 transition-colors ${className}`}
			aria-label="閉じる"
		>
			<X className="w-5 h-5" />
		</button>
	);
}
