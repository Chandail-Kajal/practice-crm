import Carousel from "@/components/Carousel";
import { getCarouselsWithImages } from "@/lib/public-apis";

type Props = {
  params: {
    carousel: string;
  };
};

export default async function Page({ params }: Props) {
  const slug = (await params).carousel;

  const carouel = await getCarouselsWithImages({
    slug,
    active: true,
    carouselActive: true,
  });

  console.log(carouel);

  return (
    <div className="bg-white h-screen w-full">
      <Carousel
        images={carouel.images}
        title={carouel.title}
        visibleCount={carouel.visible_count}
      />
    </div>
  );
}
