"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GetCattleDetailResType } from "@/services/cattleService";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { BasicInfo } from "./components/basic-info";
import { Bloodline } from "./components/bllodline";
import { Breeding } from "./components/breeding";
import { CattleDetailHeader } from "./components/hedear";
import { History } from "./components/history";

type Props = {
	cattle: GetCattleDetailResType | undefined;
	error?: string;
};

export default function CattleDetailPresentation({ cattle, error }: Props) {
	const [selectedTab, setSelectedTab] = useState("basic");
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		skipSnaps: false,
	});

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelectedTab(
			["basic", "bloodline", "breeding", "history"][
				emblaApi.selectedScrollSnap()
			],
		);
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		onSelect();
		emblaApi.on("select", onSelect);
		return () => {
			emblaApi.off("select", onSelect);
		};
	}, [emblaApi, onSelect]);

	const scrollTo = useCallback(
		(index: number) => {
			if (!emblaApi) return;
			emblaApi.scrollTo(index);
		},
		[emblaApi],
	);

	if (error) {
		return <div className="p-4">{error}</div>;
	}

	return (
		<div className="p-4">
			{cattle ? (
				<div className="mt-4 flex flex-col gap-4">
					<CattleDetailHeader cattle={cattle} />

					<Tabs value={selectedTab} className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="basic" onClick={() => scrollTo(0)}>
								基本情報
							</TabsTrigger>
							<TabsTrigger value="bloodline" onClick={() => scrollTo(1)}>
								血統
							</TabsTrigger>
							<TabsTrigger value="breeding" onClick={() => scrollTo(2)}>
								繁殖
							</TabsTrigger>
							<TabsTrigger value="history" onClick={() => scrollTo(3)}>
								活動履歴
							</TabsTrigger>
						</TabsList>

						<div className="overflow-hidden" ref={emblaRef}>
							<div className="flex gap-4">
								<div className="flex-[0_0_calc(100%-1rem)] min-w-0 h-[calc(100vh-12rem)] overflow-y-auto">
									<BasicInfo cattle={cattle} />
								</div>
								<div className="flex-[0_0_calc(100%-1rem)] min-w-0 h-[calc(100vh-12rem)] overflow-y-auto">
									<Bloodline cattle={cattle} />
								</div>
								<div className="flex-[0_0_calc(100%-1rem)] min-w-0 h-[calc(100vh-12rem)] overflow-y-auto">
									<Breeding cattle={cattle} />
								</div>
								<div className="flex-[0_0_calc(100%-1rem)] min-w-0 h-[calc(100vh-12rem)] overflow-y-auto">
									<History cattle={cattle} />
								</div>
							</div>
						</div>
					</Tabs>
				</div>
			) : (
				<p>読み込み中...</p>
			)}
		</div>
	);
}
