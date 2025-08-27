"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navigation = [
	{ name: "ホーム", href: "/" },
	{ name: "記事一覧", href: "/posts" },
	{ name: "カテゴリ", href: "/categories" },
	{ name: "タグ", href: "/tags" },
	{ name: "お問い合わせ", href: "/contact" }
];

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* ロゴ */}
					<Link href="/" className="flex items-center space-x-2">
						<div className="flex items-center space-x-2">
							<Image
								src="/icons/icon-horizontal.svg"
								alt="ギュウリスト Media"
								width={100}
								height={100}
							/>
						</div>
					</Link>

					{/* デスクトップナビゲーション */}
					<nav className="hidden md:flex items-center space-x-8">
						{navigation.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								{item.name}
							</Link>
						))}
					</nav>

					{/* 検索ボタンとモバイルメニュー */}
					<div className="flex items-center space-x-2">
						<Button variant="ghost" size="icon" className="hidden md:flex">
							<Search className="h-4 w-4" />
							<span className="sr-only">検索</span>
						</Button>

						{/* モバイルメニューボタン */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden relative"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							<div className="relative w-4 h-4">
								<Menu
									className={cn(
										"h-4 w-4 absolute inset-0 transition-all duration-300 ease-in-out",
										mobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
									)}
								/>
								<X
									className={cn(
										"h-4 w-4 absolute inset-0 transition-all duration-300 ease-in-out",
										mobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
									)}
								/>
							</div>
							<span className="sr-only">メニュー</span>
						</Button>
					</div>
				</div>

				{/* モバイルメニュー */}
				<div
					className={cn(
						"md:hidden border-t overflow-hidden transition-all duration-300 ease-in-out",
						mobileMenuOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
					)}
				>
					<nav className="flex flex-col space-y-4">
						{navigation.map((item, index) => (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									"text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 px-2 py-1 transform",
									mobileMenuOpen
										? "translate-x-0 opacity-100"
										: "translate-x-4 opacity-0",
									`delay-${index * 50}`
								)}
								onClick={() => setMobileMenuOpen(false)}
							>
								{item.name}
							</Link>
						))}
						<div className="border-t pt-4">
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									"w-full justify-start transition-all duration-200 transform",
									mobileMenuOpen
										? "translate-x-0 opacity-100"
										: "translate-x-4 opacity-0",
									"delay-200"
								)}
							>
								<Search className="mr-2 h-4 w-4" />
								検索
							</Button>
						</div>
					</nav>
				</div>
			</div>
		</header>
	);
}
