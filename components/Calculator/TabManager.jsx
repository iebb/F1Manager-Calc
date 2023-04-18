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
import {useEffect, useState} from "react";
import dynamic from "next/dynamic";
import {Calculator} from "./Calculator";
import {PresetSnapshot} from "../../consts/presets";

const totalSlots = 4;

let defaultSlots = Array.from(Array(totalSlots)).map((x, i) => ({
  id: i+1,
  slotNaming: `car_${i+1}`,
  slotTitle: `Slot ${i+1}`,
}));

export function TabManager() {
  const [activeSlot, setActiveSlot] = useState({ id: -1, slotNaming: "undefined" });

  const [tab, setTab] = useState(0);
  const [slots, _setSlots] = useState([]);
  const [editText, setEditText] = useState("");
  const [openRenameId, setOpenRenameId] = useState(null);

  const setSlots = (slots) => {
    _setSlots(slots);
    localStorage.setItem("config", JSON.stringify({
      slots,
    }));
  }

  if (typeof window !== "undefined" && !slots.length) {
    try {
      if (typeof localStorage.config === "undefined") {
        setSlots(defaultSlots);
        setActiveSlot(defaultSlots[0]);
      } else {
        const config = JSON.parse(localStorage.config)
        if (config?.slots?.length > 0) {
          setSlots(config.slots)
          setActiveSlot(config.slots[0]);
        }
      }
    } catch (e) {
      console.log(e);
      _setSlots(defaultSlots);
      setActiveSlot(defaultSlots[0]);
    }
  }

  return (
    <div>
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
          </DialogContent>
        </Dialog>
        <Tabs
          value={tab}
          onChange={(_, f) => {
            setActiveSlot(slots[f])
            setTab(f)
          }}
        >
          {
            slots.map(
              (s, _idx) => <Tab label={
                <div>{s.slotTitle}
                  <IconButton size="small" sx={{ ml: 1, padding: 0 }} onClick={() => {
                    setEditText(s.slotTitle);
                    setOpenRenameId(_idx);
                  }}><Edit /></IconButton>
                </div>
              } value={_idx} key={_idx}/>
            )
          }
        </Tabs>
      </Box>
      {
        activeSlot.id !== -1 && (
          <Calculator
            key={activeSlot.id}
            target={activeSlot.slotNaming}
            preset={PresetSnapshot}
          />
        )
      }
    </div>
  );
}
export default dynamic(() => Promise.resolve(TabManager), {
  ssr: false,
});