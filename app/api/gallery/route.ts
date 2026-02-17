import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase"
import { deleteFromStorage } from "@/lib/supabase-storage-s3"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

const STORAGE_BUCKET = "portfolio"

async function removeFromSupabaseStorage(path: string): Promise<void> {
  if (!supabase) return
  await supabase.storage.from(STORAGE_BUCKET).remove([path])
}

export async function GET(request: Request) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const albumId = searchParams.get("albumId")
    const limit = searchParams.get("limit")
    const take = limit ? Math.min(parseInt(limit, 10) || 100, 100) : undefined

    if (albumId) {
      const images = await prisma.image.findMany({
        where: { albumId },
        take,
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json(images)
    }

    const images = await prisma.image.findMany({
      take,
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(images)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const ids = Array.isArray(body?.ids) ? body.ids : [body?.id].filter(Boolean)
    if (ids.length === 0) {
      return NextResponse.json(
        { error: "Provide ids array or id for image(s) to delete" },
        { status: 400 }
      )
    }

    const images = await prisma.image.findMany({
      where: { id: { in: ids } },
      select: { id: true, path: true },
    })

    for (const img of images) {
      await deleteFromStorage(img.path)
      await removeFromSupabaseStorage(img.path)
    }

    const result = await prisma.image.deleteMany({
      where: { id: { in: ids } },
    })
    return NextResponse.json({ success: true, deleted: result.count })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete image(s)" },
      { status: 500 }
    )
  }
}
