import { NextRequest, NextResponse } from "next/server";
import { conn } from "../../../../lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { img_url } = await req.json();
  const { id } = await context.params;

  await conn.execute(
    "UPDATE images SET img_url=? WHERE id=?",
    [img_url, id]
  );

  return NextResponse.json({ success: true });
}

