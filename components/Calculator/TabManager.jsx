import {Box, Button, Chip, Dialog, DialogContent, DialogTitle, Grid, IconButton, Input, Tab, Tabs} from "@mui/material";
import {driverNames} from "../../libs/driverNames";
import {Add, Edit} from "@mui/icons-material";
import {useState} from "react";
import dynamic from "next/dynamic";
import {Calculator} from "./Calculator";
import {PresetSnapshot} from "../../consts/presets";
import {useSession} from "next-auth/react";
import axios from "axios";

const totalSlots = 4;

const getDefaultSlotConfig = i => ({
  id: i,
  slotNaming: `car_${i}`,
  slotTitle: `Slot ${i}`,
});

let defaultSlots = Array.from(Array(totalSlots)).map((x, i) => getDefaultSlotConfig(i+1));

export function TabManager() {

  const {data: session, status: sessionStatus} = useSession();

  const [activeSlot, setActiveSlot] = useState({ id: -1, slotNaming: "undefined" });
  const [tab, setTab] = useState(0);
  const [slots, _setSlots] = useState([]);
  const [editText, setEditText] = useState("");
  const [openRenameSlot, setOpenRenameSlot] = useState(null);

  const setSlots = (slots) => {
    _setSlots(slots);
    const saveConfig = {slots};
    localStorage.setItem("config", JSON.stringify(saveConfig));
    if (sessionStatus === "authenticated") {
      axios.post(`/api/cloud/config`, {config: saveConfig});
    }
  }

  const createNewSlot = () => {
    let nextAvailableSlotId = 1;
    for(const slot of slots) {
      if (nextAvailableSlotId === slot.id) {
        nextAvailableSlotId++;
      }
    }
    _setSlots([...slots, getDefaultSlotConfig(nextAvailableSlotId)]);
  }

  const saveSlotEdit = () => {
    setSlots(
      slots.map(
        (x, _idx) => x.id === openRenameSlot.id ? {...x, slotTitle: editText} : x
      )
    )
    setOpenRenameSlot(null);
  }


  if (typeof window !== "undefined" && !slots.length) {
    try {
      if (typeof localStorage.config === "undefined") {
        setSlots(defaultSlots);
        setActiveSlot(defaultSlots[0]);
      } else {
        const config = JSON.parse(localStorage.config)
        if (config?.slots?.length > 0) {
          setSlots(config.slots);
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
        {
          openRenameSlot !== null && (
            <Dialog
              open
              onClose={saveSlotEdit}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">Renaming Slot {openRenameSlot.id}: <b>{openRenameSlot.slotTitle}</b></DialogTitle>
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
                <div style={{ marginTop: 20, textAlign: "right" }}>
                  <Button sx={{m: 1}} variant="contained" color="error" onClick={
                    () => {
                      setSlots(
                        slots.filter((x, _idx) => x.id !== openRenameSlot.id)
                      )
                      setOpenRenameSlot(null);
                    }
                  }>Delete this Slot</Button>
                  <Button sx={{m: 1}} variant="contained" color="primary" onClick={saveSlotEdit}>Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>
          )
        }
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
                    setOpenRenameSlot(s);
                  }}><Edit /></IconButton>
                </div>
              } value={_idx} key={_idx}/>
            )
          }

          <Button size="small" sx={{ padding: 0, float: "right" }} onClick={createNewSlot}><Add /></Button>
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