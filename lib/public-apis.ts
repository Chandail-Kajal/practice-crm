/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getCarouselsWithImages({ slug, active = true, carouselActive = true }: { slug?: string, active: boolean, carouselActive: boolean }) {
    const url = new URL("http://localhost:3000/api/carousels/images");
    url.searchParams.append("active", String(active))
    url.searchParams.append("carousel_active", String(carouselActive))
    if (slug) {
        url.searchParams.append("slug", slug);
    }

    const res = await fetch(url.toString(), {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch images");
    }

    const data = await res.json();
    return data.data || []
}