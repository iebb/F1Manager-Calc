import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Cloud, ChevronDown } from "lucide-react";
import { Button } from "./ui/Button";
import AuthDialog from "./AuthDialog";
import SetCredentialsDialog from "./SetCredentialsDialog";

export default function LogIn() {
  const { data: session } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [credOpen, setCredOpen] = useState(false);

  // Signed in: a single button merging the cloud-sync status, avatar and account menu.
  if (session) {
    const name = session.user?.name || "Account";
    const image = session.user?.image;
    // discord_profile is undefined for credentials users — guard it.
    const discriminator = session.user?.discord_profile?.discriminator;

    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            title="Cloud sync on"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-raised pl-2.5 pr-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Cloud size={16} className="text-success" />
            {image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={image}
                alt={name}
                className="h-6 w-6 rounded-full border border-line object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="grid h-6 w-6 place-items-center rounded-full border border-line bg-primary text-xs font-semibold uppercase text-primary-fg"
              >
                {name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="hidden max-w-[110px] truncate sm:inline">{name}</span>
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
                {name}
                {discriminator ? `#${discriminator}` : ""}
              </div>
            </div>
            <DropdownMenu.Separator className="my-1 h-px bg-line" />
            <DropdownMenu.Item
              onSelect={() => setCredOpen(true)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none data-[highlighted]:bg-surface-hover"
            >
              Set username &amp; password
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => signOut()}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none data-[highlighted]:bg-surface-hover"
            >
              Log Out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
        <SetCredentialsDialog open={credOpen} onOpenChange={setCredOpen} />
      </DropdownMenu.Root>
    );
  }

  // Signed out: a compact "Sign in" button that opens the auth dialog.
  return (
    <>
      <Button variant="primary" onClick={() => setAuthOpen(true)} title="Sign in to enable cloud sync">
        Sign in
      </Button>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
