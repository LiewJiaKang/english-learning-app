"use client";

import Dashboard from "@/components/dashboard";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { WavyBackground } from "@/components/ui/wavy-background";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRef } from "react";
import { Analytics } from "@vercel/analytics/next"

function HeroContent({ onEnter }: { onEnter: () => void }) {
  return (
    <>
      <div className="text-6xl md:text-8xl font-black text-center tracking-tight text-shadow-lg">
        Welcome to <span className="text-blue-600 dark:text-blue-400">ELA</span>
      </div>

      <div className="text-3xl md:text-4xl font-black text-center text-shadow-lg">
        <span className="text-blue-600 dark:text-blue-400">E</span>nglish{" "}
        <span className="text-blue-600 dark:text-blue-400">L</span>earning{" "}
        <span className="text-blue-600 dark:text-blue-400">A</span>pp
      </div>
      <TextGenerateEffect className="max-w-lg mb-4 text-center" words={"A welcoming space for everyone to learn English—whatever your background, race, or belief."} />
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        onClick={onEnter}
        className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
      >
        Learn More
      </HoverBorderGradient>
    </>
  );
}

export default function Page() {
  const { resolvedTheme } = useTheme();
  const featuresRef = useRef<HTMLDivElement | null>(null);

  const handleEnter = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: session } = useSession();

  if (session) {
    return <>
      <Header />
      <Dashboard />
      <Analytics />
      <Footer />
    </>;
  }

  return (
    <>
      <Header />

      <WavyBackground
        key={resolvedTheme}
        className="flex flex-col items-center justify-center px-6 pb-8 w-full overflow-x-hidden"
        backgroundFill={resolvedTheme === "dark" ? "#000000" : "#ffffff"}
      >
        <HeroContent onEnter={handleEnter} />
      </WavyBackground>

      {/* FEATURES SECTION */}
      <section
        ref={featuresRef}
        className="py-32 px-6 bg-background mt-10"
      >
        <div className="max-w-6xl mx-auto text-center space-y-16">

          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">
              Tools That Actually Help
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Clear, actionable feedback with no fluff and vague feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 text-left">

            <Card>
              <CardHeader>
                <CardTitle>Reading Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Choose a topic and level, and get a custom essay to read.
                  Tap any word to see its definition.
                </p>
                <Link href="./essay">
                  <Button className="mt-4">Read More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grammar Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time corrections, sentence refiner, and vocabulary builder.
                </p>
                <Button className="mt-4">Improve now</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flashcards & Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn new words and grammar rules without the boredom.
                </p>
                <Button className="mt-4">Explore</Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>
      <div className="border-t border-border py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Why We Built This
          </h2>
          <p>
            Because language tools should actually help you improve.
            <br />We decided to build one that does.
          </p>
        </div>
      </div>
      <Analytics />
      <Footer />
    </>
  );
}

