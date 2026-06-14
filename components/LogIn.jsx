import { useSession, signIn, signOut } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Cloud, CloudOff, ChevronDown } from "lucide-react";
import { Button } from "./ui/Button";

export default function LogIn() {
  const { data: session } = useSession();

  // Signed in: a single button merging the cloud-sync status, avatar and account menu.
  if (session) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            title="Cloud sync on"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-raised pl-2.5 pr-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Cloud size={16} className="text-success" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={session.user.image}
              alt={session.user.name}
              className="h-6 w-6 rounded-full border border-line object-cover"
            />
            <span className="hidden max-w-[110px] truncate sm:inline">{session.user.name}</span>
            <ChevronDown size={15} className="text-zinc-400" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[220px] rounded-xl border border-line bg-surface-raised p-1 shadow-pop animate-fade-in"
          >
            <div className="px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                <Cloud size={13} /> Cloud sync on
              </span>
              <div className="mt-1 text-sm text-zinc-300">
                {session.user.name}#{session.user.discord_profile.discriminator}
              </div>
            </div>
            <DropdownMenu.Separator className="my-1 h-px bg-line" />
            <DropdownMenu.Item
              onSelect={() => signOut()}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none data-[highlighted]:bg-surface-hover"
            >
              Log Out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  // Signed out: a single button — the cloud-off icon is the "sync disabled" indicator.
  return (
    <Button variant="primary" onClick={() => signIn("discord")} title="Sign in to enable cloud sync">
      <CloudOff size={16} />
      Discord Sign in
    </Button>
  );
}
