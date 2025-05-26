"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Calendar, List, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MobileFooterProps {
	currentPath?: string;
}

export function FooterNav({ currentPath = "/cattle" }: MobileFooterProps) {
	const router = useRouter();

	const handleGoBack = () => {
		router.back();
	};
	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
			<div className="grid grid-cols-5 items-center">
				{/* 1. 戻る（左端） */}
				<div className="flex justify-center">
					<button
						type="button"
						onClick={handleGoBack}
						className="flex flex-col items-center"
					>
						<div className="p-1 text-gray-600">
							<ArrowLeft className="h-6 w-6" />
						</div>
						<span className="text-xs text-gray-600">戻る</span>
					</button>
				</div>

				{/* 2. ホーム */}
				<div className="flex justify-center">
					<FooterItem
						icon={<Calendar className="h-6 w-6" />}
						label="予定"
						href="/schedule"
						isActive={currentPath === "/schedule"}
					/>
				</div>

				{/* 3. 新規登録（中央の大きなボタン） */}
				<div className="flex justify-center relative">
					<div className="-mt-6">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg flex flex-col items-center justify-center"
								>
									<Plus className="h-8 w-8" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="center" side="top">
								<DropdownMenuItem asChild>
									<Link href="/cattle/new">個体登録</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/events/new">イベント登録</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<span className="block text-xs text-center mt-1">新規登録</span>
					</div>
				</div>

				{/* 4. 一覧 */}
				<div className="flex justify-center">
					<FooterItem
						icon={<List className="h-6 w-6" />}
						label="一覧"
						href="/cattle"
						isActive={currentPath === "/cattle"}
					/>
				</div>

				{/* 5. 設定 */}
				<div className="flex justify-center">
					<FooterItem
						icon={<Settings className="h-6 w-6" />}
						label="設定"
						href="/settings"
						isActive={currentPath === "/settings"}
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
