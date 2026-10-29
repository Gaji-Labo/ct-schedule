"use client";

import { CTScheduleCard } from "@/components/CTScheduleCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Schedule } from "@/src/utils/member";

type Props = {
  schedules: Schedule;
};

/**
 * 週ごとの組み合わせカードを横に並べるカルーセル。
 * 初期表示 (今週が左端) では「次の週」ボタンだけを出し、進めたら「前の週」ボタンが出る。
 * 端まで進んだら「次の週」ボタンは消える。
 * ボタンはカードの上下中央、カードが見切れる左右の端に、ボタンの中心が来るように置く。
 */
export const CTScheduleCarousel = ({ schedules }: Props) => (
  <Carousel opts={{ align: "start" }} aria-label="CTの組み合わせ（週ごと）">
    <CarouselContent>
      {schedules.map((schedule, index) => (
        <CarouselItem key={schedule.date} className="flex basis-auto">
          <CTScheduleCard schedule={schedule} index={index} />
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious
      autoHide
      aria-label="前の週"
      className="left-0 -translate-x-1/2 shadow-md"
    />
    <CarouselNext
      autoHide
      aria-label="次の週"
      className="right-0 translate-x-1/2 shadow-md"
    />
  </Carousel>
);
