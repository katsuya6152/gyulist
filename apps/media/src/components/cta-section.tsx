"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, MessageCircle } from "lucide-react";
import { trackGyulistTransition, trackLineRegistration } from "@/lib/analytics";

interface CTASectionProps {
	title?: string;
	description?: string;
	className?: string;
}

export function CTASection({
	title = "ギュウリストで牛の管理を始めませんか？",
	description = "効率的な牛の管理システムで、あなたの牧場経営をサポートします。",
	className
}: CTASectionProps) {
	return (
		<Card
			className={`bg-gradient-primary text-primary-foreground ${className}`}
		>
			<CardContent className="p-8 text-center">
				<h3 className="text-2xl font-bold mb-4">{title}</h3>
				<p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
					{description}
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<Button
						asChild
						variant="secondary"
						size="lg"
						className="bg-white text-primary hover:bg-white/90"
						onClick={() => trackGyulistTransition("cta_section")}
					>
						<Link
							href="https://gyulist.jp"
							target="_blank"
							rel="noopener noreferrer"
						>
							<ExternalLink className="mr-2 h-4 w-4" />
							ギュウリストを始める
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
						className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
						onClick={() => trackLineRegistration()}
					>
						<Link
							href="https://line.me/R/ti/p/@gyulist"
							target="_blank"
							rel="noopener noreferrer"
						>
							<MessageCircle className="mr-2 h-4 w-4" />
							LINEで相談
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
