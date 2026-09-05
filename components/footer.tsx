import { Badge } from "@/components/ui/badge";
import { IconBrandGithub, IconHeart } from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-24 flex flex-col items-center justify-center text-center space-y-3">

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-normal">
            <IconBrandGithub className="h-3.5 w-3.5" />
            open source
          </Badge>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-normal">
            <IconHeart className="h-3.5 w-3.5" />
            built with care
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="font-mono text-xs mr-1">🄯</span> {new Date().getFullYear()} ELA
          <span className="mx-2 opacity-40">•</span>
          Some rights reserved, many lefts shared.
        </p>

        {/* Tagline */}
        <p className="text-xs text-muted-foreground/60">
          Free to use, free to share — because language belongs to everyone.
        </p>
      </div>
    </footer>
  );
}
