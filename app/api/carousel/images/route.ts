/* eslint-disable @typescript-eslint/no-explicit-any */
import { conn } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const slug = searchParams.get("slug");
        const active = searchParams.get("active"); // image filter
        const carouselActive = searchParams.get("carousel_active"); // 🔥 new

        let query = `
      SELECT 
        c.id as carousel_id,
        c.title,
        c.slug,
        c.visible_count,
        c.is_active as carousel_active,
        i.id as image_id,
        i.img_url,
        i.sort_order,
        i.is_active as image_active
      FROM carousel c
      LEFT JOIN images i ON i.carousel_id = c.id
    `;

        const conditions: string[] = [];
        const values: any[] = [];


        if (slug) {
            conditions.push("c.slug = ?");
            values.push(slug);
        }

        if (carouselActive === "true") {
            conditions.push("c.is_active = 1");
        }


        if (active === "true") {
            conditions.push("i.is_active = 1");
        }

        if (conditions.length) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY c.id, i.sort_order ASC";

        const [rows]: any = await conn.query(query, values);


        const map = new Map();

        rows.forEach((row: any) => {
            if (!map.has(row.carousel_id)) {
                map.set(row.carousel_id, {
                    id: row.carousel_id,
                    title: row.title,
                    slug: row.slug,
                    visible_count: row.visible_count,
                    is_active: row.carousel_active,
                    images: [],
                });
            }

            if (row.image_id) {
                map.get(row.carousel_id).images.push({
                    id: row.image_id,
                    img_url: row.img_url,
                    sort_order: row.sort_order,
                    is_active: row.image_active,
                });
            }
        });

        const result = Array.from(map.values());

        return NextResponse.json({
            success: true,
            data: slug ? result[0] || null : result,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to fetch images" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const { slug, img_url, sort_order } = await req.json();

    const [carousel]: any = await conn.query(
        "SELECT id FROM carousel WHERE slug = ? LIMIT 1",
        [slug]
    );

    const carouselId = carousel[0]?.id;

    await conn.execute(
        "INSERT INTO images (img_url, sort_order, carousel_id) VALUES (?, ?, ?)",
        [img_url, sort_order ?? 0, carouselId]
    );

    return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
    const { id, is_active } = await req.json();

    await conn.execute(
        "UPDATE images SET is_active = ? WHERE id = ?",
        [is_active, id]
    );

    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await conn.execute("DELETE FROM images WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
}
