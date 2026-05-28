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
import { SpeedInsights } from "@vercel/speed-insights/next"
import { LampContainer } from "@/components/ui/lamp";
import { IconBook, IconDeviceGamepad, IconWand } from "@tabler/icons-react";

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
      <SpeedInsights />
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
      >
        <LampContainer className="text-center md:h-screen h-[max(100vh,1000px)]">
          <h1
            className="bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 bg-clip-text text-transparent text-5xl md:text-7xl font-bold tracking-tight"
          >
            Tools That Actually Help
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Real feedback that helps you improve, one step at a time.
          </p>

          <div className="max-w-6xl grid md:grid-cols-3 gap-4 text-left mt-16 -mb-36">
            {[
              {
                title: "Reading Practice",
                desc: "Choose a topic and level, and get a custom essay to read. Tap any word to see its definition.",
                href: "/essay",
                label: "Read More",
                icon: <IconBook className="w-5 h-5" />,
              },
              {
                title: "Tools",
                desc: "Resources, exam format and dictionary.",
                href: "/tools",
                label: "Improve now",
                icon: <IconWand className="w-5 h-5" />,
              },
              {
                title: "Flashcards & Games",
                desc: "Learn new words and grammar rules without the boredom.",
                href: "/games",
                label: "Explore",
                icon: <IconDeviceGamepad className="w-5 h-5" />,
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="group relative bg-background/20 backdrop-blur-xl shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="flex flex-row items-center gap-2 text-xl font-semibold tracking-tight">
                    {item.icon}
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.desc}
                  </p>
                  <Link href={item.href || "#"}>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      {item.label}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </LampContainer>
      </section>
      <div className="relative border-t border-border py-24 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center px-4 space-y-6">
          <h2 className="text-4xl md:text-5xl font-semibold font-heading tracking-tight">
            Why We Built This
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
            We started building this app when we were in Form 5. Our English vocabulary held us back until a teacher showed us a method that actually worked. We improved faster than we expected, and we wanted other students to get the same chance. So we built this platform for everyone to use.
          </p>
          <p className="text-sm text-muted-foreground/70">— Cookers Council</p>
        </div>
      </div>
      <Analytics />
      <SpeedInsights />
      <Footer />
    </>
  );
}

