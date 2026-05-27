import EssayGenerator from "@/components/essay-generator";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkIcon } from "lucide-react";
import Link from "next/link";

export default function essay() {
    return (
        <>
            <Header />
            <div className="min-h-screen flex justify-center bg-background">
                <div className="w-full max-w-6xl py-16 px-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg w-full flex items-center justify-between">
                                <span>Reading Practice</span>
                                <Button variant="secondary" asChild>
                                    <Link href="/saved-words">
                                        <BookmarkIcon className="h-5 w-5" />
                                        Saved Words
                                    </Link>
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                Essays that teach you vocabulary as you read.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-4">
                            <EssayGenerator />
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </>
    )
}
