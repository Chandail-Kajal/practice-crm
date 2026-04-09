/* eslint-disable @typescript-eslint/no-explicit-any */
import Carousel from "@/components/Carousel";
import { getCarouselsWithImages } from "@/lib/public-apis";

export default async function Home() {
  const carousels = await getCarouselsWithImages({
    active: true,
    carouselActive: true,
  });
