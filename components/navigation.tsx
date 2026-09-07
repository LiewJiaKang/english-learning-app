"use client"

import Link from "next/link"
import {
  IconBookmark,
  IconBook,
  IconCards,
  IconDeviceGamepad,
  IconHome,
  IconTools,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Dock, DockIcon } from "@/components/ui/dock"

const floatingItems = [
  {
    title: "Home",
    href: "/",
    icon: <IconHome />,
  },
  {
    title: "Games",
    href: "/games",
    icon: <IconDeviceGamepad />,
  },
  {
    title: "Reading Practice",
    href: "/essay",
    icon: <IconBook />,
  },
  {
    title: "Flashcards",
    href: "/flashcards",
    icon: <IconCards />,
  },
  {
    title: "Tools",
    href: "/tools",
    icon: <IconTools />,
  },
  {
    title: "Saved Words",
    href: "/saved-words",
    icon: <IconBookmark />,
  },
]

export function Navigation() {
  return (
    <TooltipProvider>
      <Dock className="bg-background/50" iconMagnification={60} iconDistance={100} direction="middle">
        {floatingItems.map((item) => (
          <DockIcon key={item.title}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  aria-label={item.title}
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                      size: "icon",
                    }),
                    "size-12 rounded-full"
                  )}
                >
                  {item.icon}
                </Link>
              </TooltipTrigger>

              <TooltipContent>
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        ))}
      </Dock>
    </TooltipProvider>
  )
}
