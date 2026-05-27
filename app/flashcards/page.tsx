import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BrainCircuitIcon } from "lucide-react";
import Header from "@/components/header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/footer";
import { FlashcardClient } from "@/components/flashcard-client";

export default async function FlashcardsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) {
        redirect("/login");
    }

    const flashcards = await prisma.flashcard.findMany({
        where: {
            userId: user.id,
            nextReviewDate: {
                lte: new Date()
            }
        },
        orderBy: {
            nextReviewDate: 'asc'
        }
    });

    return (
        <>
            <Header />
            <div className="min-h-screen mt-10 mx-auto container max-w-4xl px-4 py-10 fade-in">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-conter gap-3 text-lg">
                            <BrainCircuitIcon className="mt-1 h-4 w-4 text-primary" />
                            Daily Reviews
                        </CardTitle>
                        <CardDescription>{"Review and study the vocabulary you've collected."}</CardDescription>
                    </CardHeader>
                </Card>
                <FlashcardClient initialCards={flashcards} />
            </div>
            <Footer />
        </>
    );
}
