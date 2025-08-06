"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

interface ScrollToTopProps {
	/**
	 * ボタンを表示するスクロール位置のしきい値（px）
	 * @default 200
	 */
	threshold?: number;
	/**
	 * スクロールアニメーションの持続時間（ms）
	 * @default 500
	 */
	duration?: number;
	/**
	 * 追加のCSSクラス
	 */
	className?: string;
}

export function ScrollToTop({
	threshold = 200,
	duration = 500,
	className = "",
}: ScrollToTopProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [isScrolling, setIsScrolling] = useState(false);

	// スクロール位置を監視
	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			setIsVisible(scrollY > threshold);
		};

		// スロットリング付きのスクロールイベントリスナー
		let ticking = false;
		const throttledHandleScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					handleScroll();
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener("scroll", throttledHandleScroll, { passive: true });

		// 初期状態をチェック
		handleScroll();

		return () => {
			window.removeEventListener("scroll", throttledHandleScroll);
		};
	}, [threshold]);

	// スムーズスクロール関数
	const scrollToTop = () => {
		if (isScrolling) return;

		setIsScrolling(true);

		const startPosition = window.scrollY;
		const startTime = performance.now();

		// イージング関数（ease-out-cubic）
		const easeOutCubic = (t: number): number => {
			return 1 - (1 - t) ** 3;
		};

		const animateScroll = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			const easedProgress = easeOutCubic(progress);
			const currentPosition = startPosition * (1 - easedProgress);

			window.scrollTo(0, currentPosition);

			if (progress < 1) {
				requestAnimationFrame(animateScroll);
			} else {
				setIsScrolling(false);
			}
		};

		requestAnimationFrame(animateScroll);
	};

	return (
		<button
			type="button"
			onClick={scrollToTop}
			className={`scroll-to-top-button ${
				isVisible ? "scroll-to-top-visible" : "scroll-to-top-hidden"
			} ${className}`}
			aria-label="ページの上部に戻る"
			disabled={isScrolling}
			style={{
				opacity: isVisible ? 1 : 0,
				transform: isVisible
					? "translateY(0) scale(1)"
					: "translateY(20px) scale(0.8)",
			}}
		>
			<ChevronUp
				className={`w-6 h-6 transition-transform duration-200 ${
					isScrolling ? "animate-bounce" : ""
				}`}
			/>
		</button>
	);
}
