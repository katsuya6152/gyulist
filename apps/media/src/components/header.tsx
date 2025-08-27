"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
							<div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
								<span className="text-primary-foreground font-bold text-sm">
									G
								</span>
							</div>
							<span className="font-bold text-xl text-foreground">
								ギュウリスト <span className="text-primary">Media</span>
							</span>
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
							className="md:hidden"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className="h-4 w-4" />
							) : (
								<Menu className="h-4 w-4" />
							)}
							<span className="sr-only">メニュー</span>
						</Button>
					</div>
				</div>

				{/* モバイルメニュー */}
				{mobileMenuOpen && (
					<div className="md:hidden border-t py-4">
						<nav className="flex flex-col space-y-4">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
									onClick={() => setMobileMenuOpen(false)}
								>
									{item.name}
								</Link>
							))}
							<div className="border-t pt-4">
								<Button
									variant="ghost"
									size="sm"
									className="w-full justify-start"
								>
									<Search className="mr-2 h-4 w-4" />
									検索
								</Button>
							</div>
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}
