"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const socialLinks = [
  { label: "GitHub", icon: Github, href: "https://github.com" },
  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { label: "Twitter", icon: Twitter, href: "https://twitter.com" },
];

export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Avatar */}
        <Link
          href="/"
          className={cn(
            "relative group",
            "w-10 h-10 rounded-full overflow-hidden",
            "ring-2 ring-white/10 hover:ring-white/20",
            "transition-all duration-300",
            "hover:scale-105"
          )}
        >
          <Image
            src="/ion.jpeg"
            alt="Ion Mesca"
            fill
            className="object-cover"
            sizes="40px"
            priority
          />
        </Link>

        {/* Social Links */}
        <div className="flex items-center gap-1">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-center",
                      "w-8 h-8 rounded-lg",
                      "text-white/40 hover:text-white/70",
                      "transition-colors duration-200"
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="sr-only">{link.label}</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>
                  {link.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </header>
  );
}
