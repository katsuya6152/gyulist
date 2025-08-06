"use client";

import { ArrowLeft, Calendar, List, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function FooterNav() {
	const pathname = usePathname();
	const router = useRouter();

	const handleGoBack = () => {
		router.back();
	};

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border/50 shadow-lg shadow-black/5 px-2 py-3 z-50">
			<div className="grid items-center grid-cols-5">
				{/* 戻るボタン */}
				<div className="flex justify-center">
					<button
						type="button"
						onClick={handleGoBack}
						className="flex flex-col items-center transition-colors duration-200 hover:text-primary"
					>
						<div className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-muted/50">
							<ArrowLeft className="h-5 w-5" />
						</div>
						<span className="text-xs font-medium">戻る</span>
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
			className={`flex flex-col items-center transition-all duration-200 hover:text-primary ${
				isActive ? "text-primary" : "text-muted-foreground"
			}`}
		>
			<div
				className={`p-1.5 rounded-lg transition-all duration-200 ${
					isActive
						? "bg-primary/10 text-primary shadow-sm"
						: "hover:bg-muted/50"
				}`}
			>
				{icon}
			</div>
			<span
				className={`text-xs font-medium mt-0.5 ${
					isActive ? "text-primary" : ""
				}`}
			>
				{label}
			</span>
		</Link>
	);
}
