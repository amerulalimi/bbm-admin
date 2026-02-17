import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { z } from "zod"

const updateAlbumSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  coverUrl: z.string().url().optional().nullable(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Invalid album ID" }, { status: 400 })
    }

    const body = await req.json()
    const validated = updateAlbumSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error },
        { status: 400 }
      )
    }

    const album = await prisma.album.findUnique({ where: { id } })
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    const updated = await prisma.album.update({
      where: { id },
      data: validated.data,
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update album" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Invalid album ID" }, { status: 400 })
    }

    const album = await prisma.album.findUnique({ where: { id } })
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.image.updateMany({ where: { albumId: id }, data: { albumId: null } }),
      prisma.album.delete({ where: { id } }),
    ])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete album" },
      { status: 500 }
    )
  }
}
