import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  try {
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { word } = body

    if (!word) {
      return new NextResponse("Word is required", { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    const savedWord = await prisma.savedWord.create({
      data: {
        word,
        userId: dbUser.id,
      },
    })

    await prisma.flashcard.create({
      data: {
        word,
        userId: dbUser.id,
      },
    })

    return NextResponse.json(savedWord)
  } catch (error) {
    const err = error as { code?: string }
    if (err.code === "P2002") {
      return new NextResponse("Word already saved", { status: 409 })
    }
    console.error("Error saving word:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

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

    const savedWords = await prisma.savedWord.findMany({
      where: {
        userId: dbUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(savedWords)
  } catch (error) {
    console.error("Error getting words:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { id } = body

    if (!id) {
      return new NextResponse("ID is required", { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    const existingWord = await prisma.savedWord.findUnique({
      where: { id },
    })

    if (existingWord) {
      await prisma.flashcard.deleteMany({
        where: {
          word: existingWord.word,
          userId: dbUser.id,
        },
      })
      await prisma.savedWord.delete({
        where: { id },
      })
    }

    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("Error deleting word:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
