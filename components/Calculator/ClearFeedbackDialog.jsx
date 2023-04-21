import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

export function ClearFeedbackDialog({ isOpen, setIsOpen, clear }) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Clear Feedbacks?</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Since you moved to a new track, do you need to load the preset value and clear all previous feedbacks?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={() => {
          setIsOpen(false);
          clear();
        }}>Clear</Button>
        <Button variant="contained" onClick={() => {
          setIsOpen(false);
        }} autoFocus>
          Preserve
        </Button>
      </DialogActions>
    </Dialog>
  )
}