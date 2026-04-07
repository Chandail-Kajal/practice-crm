import { NextRequest, NextResponse } from "next/server";
import { conn } from "../../../../lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { img_url } = await req.json();

  await conn.execute(
    "UPDATE images SET img_url=? WHERE id=?",
    [img_url, params.id]
  );

  return NextResponse.json({ success: true });
}