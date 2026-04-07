import { NextRequest, NextResponse } from "next/server";
import { conn } from "../../../lib/db";


export async function GET() {
  try {
    const [rows] = await conn.query("SELECT * FROM images ORDER BY id DESC");

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { img_url, index } = body;

    if (!img_url) {
      return NextResponse.json(
        { success: false, error: "img_url is required" },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO images (img_url, sort_order)
      VALUES (?, ?)
    `;

    const [result] = await conn.execute(query, [
      img_url,
      index ?? 0,
    ]);

    return NextResponse.json({
      success: true,
      insertedId: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to insert data" },
      { status: 500 }
    );
  }
}