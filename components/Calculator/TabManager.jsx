import {Box, Button, Chip, Dialog, DialogContent, DialogTitle, Grid, IconButton, Input, Tab, Tabs} from "@mui/material";
import {driverNames} from "../../libs/driverNames";
import {Add, Edit} from "@mui/icons-material";
import {useState} from "react";
import {Calculator} from "./Calculator";
import {PresetSnapshot} from "../../consts/presets";
import {useDispatch, useSelector} from "react-redux";
import {addSlot, removeSlot, renameSlot} from "../../libs/reducers/configReducer";

/*

 */

export function TabManager() {

  const config = useSelector(state => state.config)
  const { slots } = config;

  const dispatch = useDispatch()

  const [activeSlot, setActiveSlot] = useState(slots[0]);
  const [tab, setTab] = useState(0);

  const [editText, setEditText] = useState("");
  const [openRenameSlot, setOpenRenameSlot] = useState(null);

  const saveSlotEdit = () => {
    dispatch(renameSlot({ id: openRenameSlot.id, slotTitle: editText }))
    setOpenRenameSlot(null);
  }

  if (typeof window !== "undefined" && !slots.length) {
    if (config?.slots?.length > 0) {
      setSlots(config.slots);
      setActiveSlot(config.slots[0]);
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
                      dispatch(removeSlot({ id: openRenameSlot.id }));
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
          <Button size="small" sx={{ padding: 0, float: "right" }} onClick={() => dispatch(addSlot())}><Add /></Button>
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
