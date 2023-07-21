import {Add, Edit} from "@mui/icons-material";
import {Box, Button, Chip, Dialog, DialogContent, DialogTitle, Grid, IconButton, Input, Tab, Tabs} from "@mui/material";
import {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {driverNames} from "../../consts/driverNames";
import {addSlot, removeSlot, renameSlot} from "../../libs/reducers/configReducer";
import {Calculator} from "./Calculator";

export function TabManager() {
  const config = useSelector(state => state.config)
  const { slots } = config;
  const dispatch = useDispatch()
  const [tab, setTab] = useState(0);
  const [editText, setEditText] = useState("");
  const [openRenameSlot, setOpenRenameSlot] = useState(null);

  const saveSlotEdit = () => {
    dispatch(renameSlot({ id: openRenameSlot.id, slotTitle: editText }))
    setOpenRenameSlot(null);
  }

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Dialog
          open={Boolean(openRenameSlot)}
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
              {
                slots.length > 1 && (
                  <Button sx={{m: 1}} variant="contained" color="error" onClick={
                    () => {
                      setTab(tab > 0 ? tab - 1 : 0);
                      dispatch(removeSlot({id: openRenameSlot.id}));
                      setOpenRenameSlot(null);
                    }
                  }>Delete this Slot</Button>
                )
              }
              <Button sx={{m: 1}} variant="contained" color="primary" onClick={saveSlotEdit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Tabs
          value={tab}
          onChange={(_, f) => {
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
        config.slots.length > 0 && (
          <Calculator
            key={tab}
            slot={config.slots[tab]}
          />
        )
      }
    </div>
  );
}
