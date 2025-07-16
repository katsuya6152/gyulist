"use client";

import { Calendar, List, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FooterNav() {
	const pathname = usePathname();
	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
			<div className="grid grid-cols-4 items-center">
				{/* 1. 予定 */}
				<div className="flex justify-center">
					<FooterItem
						icon={<Calendar className="h-6 w-6" />}
						label="予定"
						href="/schedule"
						isActive={pathname === "/schedule"}
					/>
				</div>

				{/* 2. 一覧 */}
				<div className="flex justify-center">
					<FooterItem
						icon={<List className="h-6 w-6" />}
						label="一覧"
						href="/cattle"
						isActive={pathname === "/cattle"}
					/>
				</div>

				{/* 3. 個体登録 */}
				<div className="flex justify-center">
					<FooterItem
						icon={<Plus className="h-6 w-6" />}
						label="個体登録"
						href="/cattle/new"
						isActive={pathname === "/cattle/new"}
					/>
				</div>

				{/* 4. 設定 */}
				<div className="flex justify-center">
					<FooterItem
						icon={<Settings className="h-6 w-6" />}
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
		<Link href={href} className="flex flex-col items-center">
			<div className={`p-1 ${isActive ? "text-green-600" : "text-gray-600"}`}>
				{icon}
			</div>
			<span
				className={`text-xs ${isActive ? "text-green-600 font-medium" : "text-gray-600"}`}
			>
				{label}
			</span>
		</Link>
	);
}
