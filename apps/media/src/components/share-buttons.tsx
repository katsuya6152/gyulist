"use client";

import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Link as LinkIcon, Copy } from "lucide-react";
import { useState } from "react";
import { trackShare } from "@/lib/analytics";

interface ShareButtonsProps {
	url: string;
	title: string;
	description?: string;
	className?: string;
}

export function ShareButtons({
	url,
	title,
	description,
	className
}: ShareButtonsProps) {
	const [copied, setCopied] = useState(false);

	const shareData = {
		url: encodeURIComponent(url),
		title: encodeURIComponent(title),
		description: encodeURIComponent(description || "")
	};

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			trackShare("copy", title);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("URLのコピーに失敗しました:", error);
		}
	};

	const shareUrls = {
		twitter: `https://twitter.com/intent/tweet?url=${shareData.url}&text=${shareData.title}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareData.url}`
	};

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<span className="text-sm font-medium text-muted-foreground">シェア:</span>

			<Button
				variant="outline"
				size="sm"
				onClick={() => {
					trackShare("twitter", title);
					window.open(shareUrls.twitter, "_blank", "width=600,height=400");
				}}
				className="flex items-center gap-1"
			>
				<Twitter className="h-4 w-4" />
				<span className="hidden sm:inline">X</span>
			</Button>

			<Button
				variant="outline"
				size="sm"
				onClick={() => {
					trackShare("facebook", title);
					window.open(shareUrls.facebook, "_blank", "width=600,height=400");
				}}
				className="flex items-center gap-1"
			>
				<Facebook className="h-4 w-4" />
				<span className="hidden sm:inline">Facebook</span>
			</Button>

			<Button
				variant="outline"
				size="sm"
				onClick={handleCopyUrl}
				className="flex items-center gap-1"
			>
				{copied ? (
					<>
						<Copy className="h-4 w-4" />
						<span className="hidden sm:inline">コピー済み</span>
					</>
				) : (
					<>
						<LinkIcon className="h-4 w-4" />
						<span className="hidden sm:inline">URLコピー</span>
					</>
				)}
			</Button>
		</div>
	);
}
