"use client";

import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, List, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FooterNav() {
	const pathname = usePathname();

	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
			<div className="flex justify-around items-center max-w-screen-lg mx-auto">
				<BackButton />
				<Button variant="ghost" size="icon" asChild>
					<Link href="/schedule">
						<Calendar className="h-5 w-5" />
					</Link>
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<Plus className="h-5 w-5" />
						</Button>
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
				<Button variant="ghost" size="icon" asChild>
					<Link href="/cattle">
						<List className="h-5 w-5" />
					</Link>
				</Button>
				<Button variant="ghost" size="icon" asChild>
					<Link href="/settings">
						<Settings className="h-5 w-5" />
					</Link>
				</Button>
			</div>
		</nav>
	);
}
