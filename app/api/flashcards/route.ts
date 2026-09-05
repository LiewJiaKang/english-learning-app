import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateSM2 } from "@/lib/sm2"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    const flashcards = await prisma.flashcard.findMany({
      where: {
        userId: dbUser.id,
        nextReviewDate: {
          lte: new Date(),
        },
      },
      orderBy: {
        nextReviewDate: "asc",
      },
    })

    return NextResponse.json(flashcards)
  } catch (error) {
    console.error("Error getting flashcards:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { id, quality } = body

    if (!id || quality === undefined || quality < 0 || quality > 5) {
      return new NextResponse("Invalid id or quality", { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id },
    })

    if (!flashcard || flashcard.userId !== dbUser.id) {
      return new NextResponse("Flashcard not found or unauthorized", {
        status: 404,
      })
    }

    const nextData = calculateSM2(
      quality,
      flashcard.repetition,
      flashcard.interval,
      flashcard.easinessFactor
    )

    const updated = await prisma.flashcard.update({
      where: { id },
      data: {
        repetition: nextData.repetition,
        interval: nextData.interval,
        easinessFactor: nextData.easinessFactor,
        nextReviewDate: nextData.nextReviewDate,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating flashcard:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
