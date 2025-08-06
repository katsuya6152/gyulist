"use client";

import { ArrowLeft, Calendar, List, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function FooterNav() {
	const pathname = usePathname();
	const router = useRouter();
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	const handleGoBack = () => {
		router.back();
	};

	// スクロール検知とフッターの表示/非表示制御
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const isScrollingDown = currentScrollY > lastScrollY;
			const isScrolledPastThreshold = currentScrollY > 150; // しきい値を150pxに調整

			if (isScrolledPastThreshold) {
				// 下スクロール時は隠す、上スクロール時は表示
				setIsVisible(!isScrollingDown);
			} else {
				// ページ上部では常に表示
				setIsVisible(true);
			}

			setLastScrollY(currentScrollY);
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

		return () => {
			window.removeEventListener("scroll", throttledHandleScroll);
		};
	}, [lastScrollY]);

	return (
		<div
			className={`fixed bottom-0 left-0 right-0 z-50 px-2 py-3 transition-all duration-300 ease-out glass-effect-strong ${
				isVisible
					? "footer-visible opacity-100"
					: "footer-hidden opacity-0 pointer-events-none"
			}`}
		>
			{/* ガラス風エフェクトのための追加のオーバーレイ */}
			<div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />

			<div className="relative z-10 grid items-center grid-cols-5">
				{/* 戻るボタン */}
				<div className="flex justify-center">
					<button
						type="button"
						onClick={handleGoBack}
						className="flex flex-col items-center transition-all duration-200 hover:text-primary tap-feedback group"
					>
						<div className="p-2 rounded-xl transition-all duration-200 hover:bg-white/20 hover:shadow-lg group-hover:scale-110 backdrop-blur-sm">
							<ArrowLeft className="h-5 w-5 transition-transform duration-200" />
						</div>
						<span className="text-xs font-medium mt-1 transition-all duration-200">
							戻る
						</span>
					</button>
				</div>

				{/* 1. 予定 */}
				<div className="flex justify-center">
					<FooterItem
						icon={<Calendar className="h-5 w-5" />}
						label="予定"
						href="/schedule?filter=today"
						isActive={pathname === "/schedule"}
					/>
				</div>

				{/* 2. 一覧 */}
				<div className="flex justify-center">
					<FooterItem
						icon={<List className="h-5 w-5" />}
						label="一覧"
						href="/cattle"
						isActive={pathname === "/cattle"}
					/>
				</div>

				{/* 3. 個体登録 */}
				<div className="flex justify-center">
					<FooterItem
						icon={<Plus className="h-5 w-5" />}
						label="個体登録"
						href="/cattle/new"
						isActive={pathname === "/cattle/new"}
					/>
				</div>

				{/* 4. 設定 */}
				<div className="flex justify-center">
					<FooterItem
						icon={<Settings className="h-5 w-5" />}
						label="設定"
						href="/settings"
						isActive={pathname === "/settings"}
					/>
				</div>
			</div>
		</div>
	);
}

interface FooterItemProps {
	icon: React.ReactNode;
	label: string;
	href: string;
	isActive: boolean;
}

function FooterItem({ icon, label, href, isActive }: FooterItemProps) {
	return (
		<Link
			href={href}
			className={`flex flex-col items-center transition-all duration-300 tap-feedback group ${
				isActive ? "text-primary" : "text-foreground/70 hover:text-primary"
			}`}
		>
			<div
				className={`p-2 rounded-xl transition-all duration-300 relative overflow-hidden ${
					isActive
						? "bg-gradient-primary text-primary-foreground shadow-lg scale-110 animate-scale-in"
						: "hover:bg-white/20 hover:shadow-md group-hover:scale-110 backdrop-blur-sm"
				}`}
			>
				<div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

				<div
					className={`relative z-10 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-105"}`}
				>
					{icon}
				</div>
			</div>
			<span
				className={`text-xs font-medium mt-1 transition-all duration-200 ${
					isActive ? "text-primary font-semibold" : "group-hover:font-medium"
				}`}
			>
				{label}
			</span>
		</Link>
	);
}
