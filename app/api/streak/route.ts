import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { streak: true },
    })

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    const now = new Date()
    const todayStr = now.toDateString()

    let streak = dbUser.streak

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId: dbUser.id,
          currentStreak: 1,
          highestStreak: 1,
          lastPracticeDate: now,
        },
      })
      return NextResponse.json(streak)
    }

    const lastPracticeStr = streak.lastPracticeDate.toDateString()

    if (todayStr === lastPracticeStr) {
      // Already practiced today, do nothing
      return NextResponse.json(streak)
    }

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()

    let newCurrentStreak = streak.currentStreak

    if (lastPracticeStr === yesterdayStr) {
      newCurrentStreak += 1
    } else {
      newCurrentStreak = 1
    }

    const newHighestStreak = Math.max(streak.highestStreak, newCurrentStreak)

    streak = await prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentStreak: newCurrentStreak,
        highestStreak: newHighestStreak,
        lastPracticeDate: now,
      },
    })

    return NextResponse.json(streak)
  } catch (error) {
    console.error("Error updating streak:", error)
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
      include: { streak: true },
    })

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json(
      dbUser.streak || { currentStreak: 0, highestStreak: 0 }
    )
  } catch (error) {
    console.error("Error getting streak:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
