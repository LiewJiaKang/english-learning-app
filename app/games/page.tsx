"use client";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { IconPlayerPlay } from "@tabler/icons-react";

export default function Page() {
  const { data: session } = useSession();
  const username = session?.user?.name || "English learner";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-12 space-y-10">
        {/* Hero section */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Learning <span className="text-primary">Games</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practice vocabulary, grammar, and spelling while playing games.
          </p>
        </div>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1" />

          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <IconPlayerPlay className="h-5 w-5 text-primary" />
                Featured Game
              </CardTitle>
              <CardDescription>
                A quick challenge to test your skills
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="relative bg-black/5 dark:bg-white/5">
              <iframe
                src={`https://turbowarp.org/1295917322/embed?username=${username}`}
                width="100%"
                height="600"
                style={{ border: "0", overflow: "hidden", colorScheme: "auto" }}
                allowFullScreen
                className="w-full min-h-112.5 md:min-h-150"
                title="Learning game"
              />
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
