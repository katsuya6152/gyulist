"use client";

import { isPCDevice } from "@/lib/device-detection";
import { Smartphone, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PCNotificationProps {
	onClose?: () => void;
}

export function PCNotification({ onClose }: PCNotificationProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [isPC, setIsPC] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);

		// クライアントサイドでのみデバイス検出を実行
		const checkDevice = () => {
			const pcDevice = isPCDevice();
			setIsPC(pcDevice);

			// PCデバイスで、かつ24時間以内に閉じられていない場合のみ表示
			if (pcDevice) {
				const dismissed = localStorage.getItem("pc-notification-dismissed");
				if (dismissed) {
					const dismissedTime = Number.parseInt(dismissed, 10);
					const now = Date.now();
					const twentyFourHours = 24 * 60 * 60 * 1000;

					if (now - dismissedTime >= twentyFourHours) {
						setIsVisible(true);
					}
				} else {
					setIsVisible(true);
				}
			}
		};

		// 初回チェック
		checkDevice();

		// 画面サイズ変更時の再チェック
		const handleResize = () => {
			checkDevice();
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleClose = () => {
		setIsVisible(false);
		onClose?.();

		// ローカルストレージに閉じたことを記録（24時間有効）
		localStorage.setItem("pc-notification-dismissed", Date.now().toString());
	};

	// マウントされるまで表示しない
	if (!isMounted || !isVisible || !isPC) return null;

	return (
		<div className="fixed top-4 left-4 z-50 w-80 animate-slide-down">
			<div className="bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-300 rounded-xl shadow-xl p-6 relative backdrop-blur-sm">
				{/* 閉じるボタン */}
				<button
					onClick={handleClose}
					className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors bg-white/80 hover:bg-white rounded-full p-1"
					aria-label="通知を閉じる"
					type="button"
				>
					<X size={14} />
				</button>

				<div className="flex flex-col items-center gap-4">
					{/* アイコン */}
					<div className="flex-shrink-0">
						<div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
							<Smartphone size={24} className="text-white" />
						</div>
					</div>

					{/* コンテンツ */}
					<div className="flex-1 min-w-0 text-center">
						<div className="flex items-center justify-center gap-2 mb-3">
							<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
							<h3 className="text-lg font-bold text-gray-900">
								スマホ専用アプリ
							</h3>
						</div>
						<p className="text-sm text-gray-700 leading-relaxed mb-6">
							ギュウリストは現在スマートフォン向けに最適化されています。
							<br />
							<span className="font-medium text-blue-700">
								PCでの表示は確認用としてご利用ください。
							</span>
							最適な体験のため、スマートフォンでのご利用をお勧めします。
						</p>

						{/* QRコード */}
						<div className="flex flex-col items-center gap-3 mb-4">
							<div className="bg-white rounded-lg p-3 shadow-md">
								<Image
									src="/qr.png"
									alt="ギュウリストQRコード"
									width={120}
									height={120}
									className="rounded-lg"
								/>
							</div>
							<p className="text-xs text-gray-600 font-medium">gyulist.com</p>
						</div>

						{/* アクションボタン */}
						<button
							onClick={handleClose}
							className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
							type="button"
						>
							了解しました
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
