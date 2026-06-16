import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/Dialog";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

const USERNAME_MIN = 3;
const USERNAME_MAX = 32;
const PASSWORD_MIN = 8;

// Attach a username/password to the currently signed-in account (e.g. Discord),
// so it can also be used to log in.
export default function SetCredentialsDialog({ open, onOpenChange }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleOpenChange(next) {
    if (!next) {
      setUsername("");
      setPassword("");
      setConfirm("");
      setError("");
      setDone(false);
      setLoading(false);
    }
    onOpenChange?.(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    const name = username.trim().toLowerCase();

    if (name.length < USERNAME_MIN || name.length > USERNAME_MAX) {
      return setError(`Username must be ${USERNAME_MIN}–${USERNAME_MAX} characters.`);
    }
    if (password.length < PASSWORD_MIN) {
      return setError(`Password must be at least ${PASSWORD_MIN} characters.`);
    }
    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-credentials", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: name, password }),
      });
      if (!res.ok) {
        let message = "Could not set credentials.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          /* keep default */
        }
        setError(message);
        setLoading(false);
        return;
      }
      setDone(true);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Set username &amp; password</DialogTitle>
        <DialogDescription>
          Add a username and password to this account so you can also sign in with them.
        </DialogDescription>

        {done ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-success">
              Done — you can now sign in with this username and password.
            </p>
            <Button variant="primary" className="w-full" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
            />
            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              Save
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
