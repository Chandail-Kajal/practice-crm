import { NextRequest, NextResponse } from "next/server";
import { conn } from "../../../../lib/db";

export async function PUT(req: NextRequest) {
  const { images } = await req.json();

  const connection = await conn.getConnection();

  try {
    await connection.beginTransaction();

    for (const img of images) {
      await connection.execute(
        "UPDATE images SET sort_order=? WHERE id=?",
        [img.sort_order, img.id]
      );
    }

    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    await connection.rollback();
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  } finally {
    connection.release();
  }
}