"use client";

import { useSidebar } from "@/components/sidebar-provider";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Home,
	List,
	Plus,
	Settings,
	Truck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function FooterNav() {
	const pathname = usePathname();
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	const { isExpanded: isSidebarExpanded, setIsExpanded } = useSidebar();
	const isDesktop = useMediaQuery("(min-width: 1024px)");

	// スクロール検知とフッターの表示/非表示制御（モバイルのみ）
	useEffect(() => {
		if (isDesktop) return; // PC版ではスクロール制御を無効化

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
	}, [lastScrollY, isDesktop]);

	// PC版のサイドバー
	if (isDesktop) {
		return (
			<div
				className={`hidden lg:block fixed left-0 top-0 h-full bg-background/95 backdrop-blur-sm border-r border-border/50 z-40 transition-all duration-300 ease-in-out ${
					isSidebarExpanded ? "w-64" : "w-16"
				}`}
			>
				<div className="flex flex-col h-full">
					{/* ヘッダー部分 */}
					<div className="flex items-center justify-between p-4 border-b border-border/50">
						{isSidebarExpanded ? (
							<div className="flex items-center gap-3">
								<div className="relative w-48 h-12">
									<Image
										src="/icon-horizontal.svg"
										alt="Gyulist"
										fill
										className="object-contain"
									/>
								</div>
							</div>
						) : null}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsExpanded(!isSidebarExpanded)}
							className="ml-auto h-8 w-8 p-0 hover:bg-muted"
						>
							{isSidebarExpanded ? (
								<ChevronLeft className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</Button>
					</div>

					{/* ナビゲーション部分 */}
					<nav className="flex-1 p-2">
						<div className="space-y-2">
							{/* ホーム */}
							<SidebarItem
								icon={<Home className="h-5 w-5" />}
								label="ホーム"
								href="/home"
								isActive={pathname === "/home"}
								isExpanded={isSidebarExpanded}
							/>

							{/* 予定 */}
							<SidebarItem
								icon={<Calendar className="h-5 w-5" />}
								label="予定"
								href="/schedule?filter=today"
								isActive={pathname.startsWith("/schedule")}
								isExpanded={isSidebarExpanded}
							/>

							{/* 一覧 */}
							<SidebarItem
								icon={<List className="h-5 w-5" />}
								label="一覧"
								href="/cattle"
								isActive={pathname === "/cattle"}
								isExpanded={isSidebarExpanded}
							/>

							{/* 個体登録 */}
							<SidebarItem
								icon={<Plus className="h-5 w-5" />}
								label="個体登録"
								href="/cattle/new"
								isActive={pathname === "/cattle/new"}
								isExpanded={isSidebarExpanded}
							/>

							{/* 出荷管理 */}
							<SidebarItem
								icon={<Truck className="h-5 w-5" />}
								label="出荷管理"
								href="/shipments"
								isActive={pathname.startsWith("/shipments")}
								isExpanded={isSidebarExpanded}
							/>

							{/* 設定 */}
							<SidebarItem
								icon={<Settings className="h-5 w-5" />}
								label="設定"
								href="/settings"
								isActive={pathname === "/settings"}
								isExpanded={isSidebarExpanded}
							/>
						</div>
					</nav>

					{/* フッター部分 */}
					<div className="p-4 border-t border-border/50">
						{isSidebarExpanded && (
							<div className="text-xs text-muted-foreground text-center">
								Gyulist v1.0
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// モバイル版のフッター
	return (
		<div
			className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
				isVisible
					? "footer-visible opacity-100"
					: "footer-hidden opacity-0 pointer-events-none"
			}`}
		>
			{/* 牛一覧画面での+ボタン（フッターの上） */}
			{pathname === "/cattle" && (
				<div className="absolute right-4 -top-16 z-10">
					<Button
						asChild
						size="icon"
						className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
					>
						<Link href="/cattle/new">
							<Plus className="h-6 w-6" />
						</Link>
					</Button>
				</div>
			)}

			{/* フッター本体 */}
			<div className="px-2 py-3 glass-effect-strong">
				{/* ガラス風エフェクトのための追加のオーバーレイ */}
				<div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />

				<div className="relative z-10 grid items-center grid-cols-5">
					{/* 0. ホーム */}
					<div className="flex justify-center">
						<FooterItem
							icon={<Home className="h-5 w-5" />}
							label="ホーム"
							href="/home"
							isActive={pathname === "/home"}
						/>
					</div>

					{/* 1. 予定 */}
					<div className="flex justify-center">
						<FooterItem
							icon={<Calendar className="h-5 w-5" />}
							label="予定"
							href="/schedule?filter=today"
							isActive={pathname.startsWith("/schedule")}
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

					{/* 3. 出荷管理 */}
					<div className="flex justify-center">
						<FooterItem
							icon={<Truck className="h-5 w-5" />}
							label="出荷管理"
							href="/shipments"
							isActive={pathname.startsWith("/shipments")}
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

interface SidebarItemProps {
	icon: React.ReactNode;
	label: string;
	href: string;
	isActive: boolean;
	isExpanded: boolean;
}

function SidebarItem({
	icon,
	label,
	href,
	isActive,
	isExpanded
}: SidebarItemProps) {
	return (
		<Link
			href={href}
			className={`flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 group ${
				isActive
					? "bg-primary text-primary-foreground shadow-sm"
					: "text-foreground/70 hover:bg-muted hover:text-foreground"
			}`}
		>
			<div className="flex items-center justify-center w-6 h-6">{icon}</div>
			{isExpanded && (
				<span className="ml-3 text-sm font-medium whitespace-nowrap">
					{label}
				</span>
			)}
		</Link>
	);
}
