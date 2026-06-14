import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Button } from "../ui/Button";

export function ClearFeedbackDialog(
  { isOpen, setIsOpen, clear }: { isOpen: boolean; setIsOpen: Function; clear: Function }
) {
  return (
    <Dialog open={isOpen} onOpenChange={(o: boolean) => setIsOpen(o)}>
      <DialogContent className="max-w-md">
        <DialogTitle>Clear Feedbacks?</DialogTitle>
        <DialogDescription>
          Since you moved to a new track, do you need to load the preset value and clear all previous feedbacks?
        </DialogDescription>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="danger"
            onClick={() => {
              setIsOpen(false);
              clear();
            }}
          >
            Clear
          </Button>
          <Button
            variant="primary"
            autoFocus
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Preserve
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
