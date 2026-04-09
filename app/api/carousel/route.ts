/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { conn } from "../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug");
    const active = searchParams.get("active");

    let query = "SELECT * FROM carousel";
    const values: any[] = [];
    const conditions: string[] = [];

    if (active === "true") {
      conditions.push("is_active = 1");
    }

    if (slug) {
      conditions.push("slug = ?");
      values.push(slug);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [rows] = await conn.query(query, values);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch carousels" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { title, slug } = await req.json();

  const [result]: any = await conn.execute(
    "INSERT INTO carousel (title, slug) VALUES (?, ?)",
    [title, slug]
  );

  return NextResponse.json({ success: true, id: result.insertId });
}

export async function PUT(req: NextRequest) {
  const { id, title, slug } = await req.json();

  await conn.execute(
    "UPDATE carousel SET title = ?, slug = ? WHERE id = ?",
    [title, slug, id]
  );

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const { id, is_active } = await req.json();

  await conn.execute(
    "UPDATE carousel SET is_active = ? WHERE id = ?",
    [is_active, id]
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await conn.execute("DELETE FROM carousel WHERE id = ?", [id]);

  return NextResponse.json({ success: true });
}