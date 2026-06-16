import { useState } from "react";
import { signIn } from "next-auth/react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/Dialog";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

const USERNAME_MIN = 3;
const USERNAME_MAX = 32;
const PASSWORD_MIN = 8;

export default function AuthDialog({ open, onOpenChange }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === "signup";

  function reset() {
    setUsername("");
    setPassword("");
    setConfirm("");
    setError("");
    setLoading(false);
  }

  function handleOpenChange(next) {
    if (!next) {
      // Reset to a clean state whenever the dialog closes.
      setMode("signin");
      reset();
    }
    onOpenChange?.(next);
  }

  function switchMode() {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError("");
    setConfirm("");
  }

  // Returns an error message string, or "" when valid.
  function validate(name, pass) {
    if (name.length < USERNAME_MIN || name.length > USERNAME_MAX) {
      return `Username must be ${USERNAME_MIN}–${USERNAME_MAX} characters.`;
    }
    if (pass.length < PASSWORD_MIN) {
      return `Password must be at least ${PASSWORD_MIN} characters.`;
    }
    if (isSignUp && pass !== confirm) {
      return "Passwords do not match.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    const name = username.trim().toLowerCase();
    const pass = password;

    const validationError = validate(name, pass);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username: name, password: pass }),
        });
        if (!res.ok) {
          let message = "Could not create account.";
          try {
            const data = await res.json();
            if (data?.error) message = data.error;
          } catch {
            /* ignore body parse errors, keep default message */
          }
          setError(message);
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        username: name,
        password: pass,
        redirect: false,
      });

      if (result?.error) {
        setError(
          isSignUp
            ? "Account created, but sign in failed. Please try signing in."
            : "Invalid username or password."
        );
        setLoading(false);
        return;
      }

      // Success — SessionProvider updates automatically; close the dialog.
      handleOpenChange(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function handleDiscord() {
    signIn("discord");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>{isSignUp ? "Create account" : "Sign in"}</DialogTitle>
        <DialogDescription>
          {isSignUp
            ? "Create an account to enable cloud sync."
            : "Sign in to enable cloud sync across devices."}
        </DialogDescription>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Input
            label="Username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            placeholder="your_username"
          />
          <Input
            label="Password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
          />
          {isSignUp && (
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
            />
          )}

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="mt-3 text-center text-sm text-zinc-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            disabled={loading}
            className="font-medium text-primary hover:underline disabled:opacity-40 disabled:pointer-events-none"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDiscord}
          disabled={loading}
        >
          <MessageCircle size={16} />
          Continue with Discord
        </Button>
      </DialogContent>
    </Dialog>
  );
}
