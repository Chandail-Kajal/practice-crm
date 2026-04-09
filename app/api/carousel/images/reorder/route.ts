/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { conn } from "../../../../../lib/db";

export async function PUT(req: NextRequest) {
  const { images } = await req.json();

  if (!Array.isArray(images) || images.length === 0) {
    return NextResponse.json(
      { success: false, error: "Invalid images payload" },
      { status: 400 }
    );
  }

  const connection = await conn.getConnection();

  try {
    await connection.beginTransaction();


    const ids = images.map((img: any) => img.id);

    const caseStatements = images
      .map((img: any) => `WHEN ${img.id} THEN ${img.sort_order}`)
      .join(" ");

    const query = `
      UPDATE images
      SET sort_order = CASE id
        ${caseStatements}
      END
      WHERE id IN (${ids.join(",")})
    `;

    await connection.execute(query);

    await connection.commit();

    return NextResponse.json({
      success: true,
      updated: images.length,
    });
  } catch (err) {
    await connection.rollback();

    return NextResponse.json(
      { success: false, error: "Failed to update sort order" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}