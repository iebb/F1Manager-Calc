import { cn } from "../../libs/cn";

export function Spinner({ size = 36, className }) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-line border-t-primary",
        className
      )}
      style={{ width: size, height: size }}
      role="status"
      aria-label="loading"
    />
  );
}

export function CenteredSpinner() {
  return (
    <div className="flex w-full justify-center py-16">
      <Spinner />
    </div>
  );
}
