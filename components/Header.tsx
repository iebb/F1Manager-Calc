import LogIn from "./LogIn";
import Image from "next/image";
import { useState } from "react";
import { Coffee, Settings, BookOpen, MessageCircle, HardDriveDownload } from "lucide-react";
import { Container } from "./ui/Container";
import { buttonVariants } from "./ui/Button";
import { SettingsDialog } from "./SettingsDialog";
import { cn } from "../libs/cn";

export default function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <Container className="pt-4 pb-3">
      {/* Main bar: brand + primary actions */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-[28px]">
          <span className="inline-grid place-items-center rounded-lg bg-gradient-to-br from-[#ff2e2e] to-[#b00000] px-2 py-0.5 leading-none text-white shadow-[0_2px_10px_-2px_rgba(225,6,0,0.6)]">
            F1
          </span>
          <span className="text-white">Manager</span>
          <span className="bg-gradient-to-r from-zinc-200 to-zinc-500 bg-clip-text font-bold text-transparent">
            Setup Calculator
          </span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <LogIn />
          <a
            href="https://ko-fi.com/A0A8ERCTF"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "info" }))}
          >
            <Coffee size={16} />
            Support on Ko-fi
          </a>
          <button
            type="button"
            aria-label="Settings"
            title="Settings"
            onClick={() => setSettingsOpen(true)}
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Slim secondary bar: links + app badges */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm">
        <nav className="flex flex-wrap items-center gap-2">
          <a
            href="https://steamcommunity.com/sharedfiles/filedetails/?id=2855732906"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "no-underline hover:no-underline")}
          >
            <BookOpen size={15} />
            Tutorial
          </a>
          <a
            href="https://discord.gg/u46QWWaNfV"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "no-underline hover:no-underline")}
          >
            <MessageCircle size={15} />
            Discord
          </a>
          <a
            href="https://save.f1setup.it/"
            target="_blank"
            rel="noopener noreferrer"
            title="A complete savefile modkit for Steam/Xbox"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "no-underline hover:no-underline border-emerald-500/60 bg-emerald-500/10 text-emerald-300 " +
                "shadow-[0_0_12px_-1px_rgba(16,185,129,0.65)] hover:text-emerald-200 hover:bg-emerald-500/20 " +
                "hover:shadow-[0_0_16px_0px_rgba(16,185,129,0.8)]"
            )}
          >
            <HardDriveDownload size={15} />
            Save Viewer
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-zinc-500 sm:inline">we have an app now :)</span>
          <a href="https://redirect.badasstemple.eu/f1mcios" className="transition-opacity hover:opacity-80">
            <Image alt="Download on the App Store" src={require(`../assets/AppStore.svg`)} height={30} className="inline-block" />
          </a>
          <a href="https://redirect.badasstemple.eu/f1mcandroid" className="transition-opacity hover:opacity-80">
            <Image alt="Get it on Google Play" src={require(`../assets/en_badge_web_generic.png`)} height={30} className="inline-block" />
          </a>
        </div>
      </div>

      <hr className="mt-3 border-line" />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </Container>
  );
}
