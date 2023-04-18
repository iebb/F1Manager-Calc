import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Input,
  Tab,
  Tabs
} from "@mui/material";
import {driverNames} from "../../libs/driverNames";
import {Edit} from "@mui/icons-material";
import {useState} from "react";
import dynamic from "next/dynamic";

const totalSlots = 4;

let defaultSlots = Array.from(Array(totalSlots)).map((x, i) => ({
  id: i+1,
  slotNaming: `car_${i+1}`,
  slotTitle: `Slot ${i+1}`,
}));

export function TabManager({ setSlot }) {
  const [tab, setTab] = useState(0);
  const [slots, _setSlots] = useState(defaultSlots);
  const [editText, setEditText] = useState("");
  const [openRenameId, setOpenRenameId] = useState(null);

  const setSlots = (slots) => {
    _setSlots(slots);
    localStorage.setItem("config", JSON.stringify({
      slots,
    }));
  }

  if (typeof window !== "undefined") {
    try {
      const config = JSON.parse(localStorage.config)
      setSlots(config.slots)
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Dialog
        open={openRenameId !== null}
        onClose={() => {
          setSlots(slots.map((x, _idx) => _idx === openRenameId ? {...x, slotTitle: editText} : x))
          setOpenRenameId(null);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Rename This Slot</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <div>
              <Input value={editText} onChange={e => setEditText(e.target.value)} sx={{ width: "100%" }} />
            </div>
            <div style={{ marginTop: 20 }}>
              <Grid container spacing={1}>
                {
                  driverNames.map(
                    d => <Grid item key={d}><Chip label={d} onClick={() => setEditText(d)} /></Grid>
                  )
                }
              </Grid>
            </div>
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <Tabs
        value={tab}
        onChange={(_, f) => {
          setSlot(slots[f])
          setTab(f)
        }}
      >
        {
          slots.map(
            (s, _idx) => <Tab label={
              <span>
                    {s.slotTitle}
                <IconButton size="small" sx={{ ml: 1 }} onClick={() => {
                  setEditText(s.slotTitle);
                  setOpenRenameId(_idx);
                }}>
                      <Edit />
                    </IconButton>
                  </span>
            } value={_idx} key={_idx}/>
          )
        }
      </Tabs>
    </Box>
  );
}
export default dynamic(() => Promise.resolve(TabManager), {
  ssr: false,
});