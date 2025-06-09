"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GetCattleDetailResType } from "@/services/cattleService";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { BasicInfo } from "./components/basic-info";
import { CattleDetailHeader } from "./components/hedear";

type Props = {
	cattle: GetCattleDetailResType;
};

export default function CattleDetailPresentation({ cattle }: Props) {
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
							<div className="flex">
								<div className="flex-[0_0_100%] min-w-0">
									BasicInfo
									<BasicInfo cattle={cattle} />
								</div>
								<div className="flex-[0_0_100%] min-w-0">
									Bloodline
									<BasicInfo cattle={cattle} />
									{/* <Bloodline cattle={cattle} /> */}
								</div>
								<div className="flex-[0_0_100%] min-w-0">
									Breeding
									<BasicInfo cattle={cattle} />
									{/* <Breeding
										statusData={breedingStatus?.data}
										summaryData={breedingSummary?.data}
									/> */}
								</div>
								<div className="flex-[0_0_100%] min-w-0">
									History
									<BasicInfo cattle={cattle} />
									{/* <History eventData={events?.data} /> */}
								</div>
							</div>
						</div>
					</Tabs>

					<div className="flex justify-center gap-2 text-xs text-gray-500">
						<p>登録日時: {cattle.createdAt}</p>/
						<p>更新日時: {cattle.updatedAt}</p>
					</div>
				</div>
			) : (
				<p>読み込み中...</p>
			)}
		</div>
	);
}
