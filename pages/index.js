import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import {DataGrid} from '@mui/x-data-grid';
import {BiasParams, CarSetupParams} from "../consts/params";
import {useEffect, useState} from "react";
import {SnackbarProvider, useSnackbar} from 'notistack';
import {trackMap, tracks} from "../consts/tracks";
import {Delete, Edit, OpenInNew} from "@mui/icons-material";
import KofiButton from "kofi-button";
import Image from "next/image";
import {PresetSnapshot} from "../consts/presets";
import axios from "axios";
import {arrayFloatEqual, biasToSetup, eps, nearestSetup, randomSetup, setupToBias} from "../libs/setup";

const feedbackColors = {
  optimal: "info",
  great: "primary",
  good: "white",
  bad: "error",
  "bad+": "error",
  "bad-": "error",
}

export function Calculator({ target, preset }) {

  const { enqueueSnackbar } = useSnackbar();

  const [isValidSetup, setIsValidSetup] = useState([true, true, true, true, true]);
  const [lastCarSetup, setLastCarSetup] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);

  const [carSetup, _setCarSetup] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [biasParam, _setBiasParam] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);

  const [prevCarSetup, setPrevCarSetup] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [prevBiasParam, setPrevBiasParam] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);


  const [carSetupList, setCarSetupList] = useState([]);
  const [biasParamText, setBiasParamText] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [feedback, setFeedback] = useState([[], [], [], [], []]);
  const [previousRuns, setPreviousRuns] = useState([]);
  const [possibleSetups, setPossibleSetups] = useState(1012095);

  const [track, setTrack] = useState("XX");
  const [loaded, setLoaded] = useState(false);
  const [openClearFeedback, setOpenClearFeedback] = useState(false);

  const getIdentifier = () => {
    if (typeof window !== "undefined") {
      if (!localStorage["identifier"] || localStorage["identifier"].length !== 8) {
        localStorage["identifier"] = Array.from(Array(8)).map(
          () => String.fromCharCode(Math.floor(Math.random() * 26) + 65)
        ).join("");
      }
      return localStorage["identifier"] + "-" + target.toUpperCase()
    }
    return "UNKNOWN"
  }

  useEffect(() => {
    try {
      const {
        track,
        isValidSetup,
        carSetup,
        biasParam,
        prevCarSetup,
        prevBiasParam,
        feedback,
        previousRuns,
      } = JSON.parse(localStorage[target])
      setFeedback(feedback);
      _setBiasParam(biasParam);
      _setCarSetup(carSetup);
      setPrevCarSetup(prevCarSetup);
      setPrevBiasParam(prevBiasParam);
      setPreviousRuns(previousRuns || []);
      setTrack(track);
      setIsValidSetup(isValidSetup);
    } catch {
      setPreviousRuns([]);
      setTrack("XX");
    }
    setLoaded(true);
  }, [target])

  if (loaded && typeof window !== "undefined") {
    localStorage.setItem(target, JSON.stringify({
      isValidSetup,
      carSetup,
      biasParam,
      prevCarSetup,
      prevBiasParam,
      feedback,
      track,
      previousRuns,
    }));
  }

  const setBiasParam = (e, _idx=-1) => {
    _setBiasParam(e);
    setBiasParamText(
      biasParamText.map(
        (v, idx) => idx === _idx ? biasParamText[idx] : e[idx].toFixed(6)
      )
    );
  }

  const setCarSetup = (e) => {
    _setCarSetup(e);
    setIsValidSetup(CarSetupParams.map(p => {
      if (e[p.index] < -1e-6 || e[p.index] >= 1+1e-6) {
        return false;
      }
      const roundValue = e[p.index] * (p.max - p.min) / p.step;
      return Math.abs(Math.round(roundValue) - roundValue) <= 1e-6;
    }));
  }

  const findNearest = () => {
    setPrevCarSetup(carSetup);
    setPrevBiasParam(biasParam);
    const {setup, possibleSetups, lowestRuleBreak, possibleSetupList} = nearestSetup(biasParam, feedback);
    if (setup) {
      if (lowestRuleBreak > 0) {
        enqueueSnackbar(
          'Unable to find a valid setup matching all feedbacks. This is the closest we could get.',
          { variant: "warning" }
        );
        setPossibleSetups(0);
      } else {

        if (possibleSetups === 1) {
          axios.post(`/api/report_vals`, {
            uid: getIdentifier(),
            track,
            values: setup,
          });
        }
        setPossibleSetups(possibleSetups);
      }
      setBiasParam(setupToBias(setup));
      setCarSetup(setup);
      setCarSetupList(possibleSetupList);
    } else {
      enqueueSnackbar(
        'Unable to find a valid setup matching all feedbacks. Try deleting some feedbacks.',
        { variant: "error" }
      );
    }

    if (typeof window !== "undefined") {
      localStorage.c = Number(localStorage.c || 0) + 1
    }
  }

  const clearAll = () => {
    setFeedback([[], [], [], [], []]);
    setPreviousRuns([]);
    setLastCarSetup(carSetup);
  }

  const clearFeedbacks = () => {
    setFeedback([[], [], [], [], []]);
    setLastCarSetup(carSetup);
    // setPreviousRuns([]);
  }

  const createFeedback = (row, biasValue, v) => {
    const matchedRuns = previousRuns.filter(x => (
      x.track === track &&
      arrayFloatEqual(x.carSetup, carSetup)
    ))

    if (matchedRuns.length) {
      setPreviousRuns(
        previousRuns.map(x => x.id === matchedRuns[0].id ? {
          ...x,
          ["feedback_" + row.index]: {
            value: biasValue,
            timestamp: +new Date(),
            feedback: v
          },
        } : x)
      )
    } else {
      setPreviousRuns([
        {
          track,
          carSetup: JSON.parse(JSON.stringify(carSetup)),
          ["feedback_" + row.index]: {
            value: biasValue,
            timestamp: +new Date(),
            feedback: v
          },
          id: +new Date(),
        }, ...previousRuns
      ])
    }
    setLastCarSetup(carSetup)
    setFeedback(
      feedback.map((x, idx) => idx === row.index ? [
        ...x.filter(x => x.value !== biasValue), {
          value: biasValue,
          timestamp: +new Date(),
          feedback: v
        }
      ]: x)
    )

    if (v === "optimal" && Number(localStorage.c) > 6 && Object.keys(preset).length) {
      axios.post(`/api/report`, {
        uid: getIdentifier(),
        track,
        value: biasValue,
        feedback: v,
        index: row.index,
      });
    }
  }

  const loadPreset = () => {
    if (preset[track]) {
      const {setup} = nearestSetup(
        preset[track], [[], [], [], [], []]
      );
      setCarSetup(setup);
      setBiasParam(setupToBias(setup));
    }
  }

  try {

    return (
      <Container disableGutters maxWidth="xl" key={target}>
        <Divider variant="fullWidth" />
        <Dialog
          open={openClearFeedback}
          onClose={() => {
            setOpenClearFeedback(false);
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
              setOpenClearFeedback(false);
              clearFeedbacks();
              loadPreset();
            }}>Clear</Button>
            <Button variant="contained" onClick={() => {
              setOpenClearFeedback(false);
            }} autoFocus>
              Preserve
            </Button>
          </DialogActions>
        </Dialog>
        <Container maxWidth="xl" component="main" sx={{ pt: 2, pb: 6 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2} sx={{ textAlign: 'right' }}>
                        <div style={{ padding: 5, width: "100%" }}>
                          <Typography sx={{ color: "#777", display: "inline-block", verticalAlign: "middle" }}>Track Select:</Typography>
                          <FormControl variant="standard" sx={{ ml: 3, display: "inline-block", verticalAlign: "middle" }}>
                            <Select
                              value={track}
                              sx={{ width: "100%" }}
                              onChange={(e) => {
                                setTrack(e.target.value);
                                setOpenClearFeedback(true);
                              }}
                              label="Track"
                            >
                              {tracks.map(t => <MenuItem key={t.id} value={t.id}>
                                <Image src={require(`../assets/flags/${t.id}.svg`)} width={24} height={20} alt={t.country} style={{ display: 'inline-block' }} />
                                <Typography sx={{ m: 0, ml: 1,  display: 'inline-block' }}> {t.name}, {t.country}</Typography>
                              </MenuItem>)}
                            </Select>
                          </FormControl>
                        </div>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Grid direction="row-reverse" container spacing={1}>
                          <Grid item>
                            <Button variant="contained" color="secondary" onClick={
                              () => {
                                loadPreset()
                              }
                            }>Load Preset</Button>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ width: 160, fontSize: 18 }}><b>Setup</b></TableCell>
                      <TableCell sx={{ minWidth: 360, fontSize: 18 }}><b>Values</b></TableCell>
                      <TableCell sx={{ fontSize: 18, textAlign: 'right' }}><b>Compare</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      CarSetupParams.map(row => {
                        let carSetupDiff = carSetup[row.index] - lastCarSetup[row.index];
                        if (Math.abs(carSetupDiff) < eps) {
                          carSetupDiff = 0;
                        }
                        return (
                          <TableRow key={row.name}>
                            <TableCell sx={{ fontSize: 16 }}><b>{row.name}</b></TableCell>
                            <TableCell>
                              <Slider
                                marks
                                color={
                                  (carSetup[row.index] > 1 || carSetup[row.index] < 0) ?
                                    "error" : (isValidSetup[row.index] ? "primary" : "warning")
                                }
                                step={row.step / (row.max - row.min)}
                                max={Math.max(1, carSetup[row.index])}
                                min={Math.min(0, carSetup[row.index])}
                                valueLabelFormat={v => row.render(v * (row.max - row.min) + row.min)}
                                valueLabelDisplay="on"
                                value={carSetup[row.index]}
                                onChange={(e, value) => {
                                  const setup = carSetup.map((x, idx) => idx === row.index ? (
                                    Math.round(value * 560) / 560
                                  ): x);
                                  setCarSetup(setup)
                                  setBiasParam(setupToBias(setup))
                                  setIsValidSetup(
                                    isValidSetup.map((x, idx) => idx === row.index ? (
                                      carSetup[row.index] >= 0 && carSetup[row.index] <= 1
                                    ) : x)
                                  )
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: 16, textAlign: 'right' }}>
                              <Typography sx={{ color: carSetupDiff > 0 ? "#ff6383" : carSetupDiff < 0 ? "#76ff03" : "white" }}>{carSetupDiff > 0 ? "▲" : carSetupDiff < 0 ? "▼" : ""} {
                                row.render(carSetup[row.index] * (row.max - row.min) + row.min)
                              }</Typography>
                              {
                                Math.abs(carSetupDiff) > eps && (
                                  <Typography sx={{ color: "#777" }}>Prev: {
                                    row.render(lastCarSetup[row.index] * (row.max - row.min) + row.min)
                                  }</Typography>
                                )
                              }
                            </TableCell>
                          </TableRow>
                        )
                      })
                    }
                  </TableBody>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'right' }}>
                        <Stack direction="row-reverse" spacing={1}>
                          <Button variant="contained" onClick={findNearest}>Find Setup</Button>
                          <Button variant="contained" color="secondary" onClick={
                            () => {
                              const setup = [1, 1, 1, 1, 1];
                              setBiasParam(setupToBias(setup));
                              setCarSetup(setup);
                            }
                          }>Max</Button>
                          <Button variant="contained" color="secondary" onClick={
                            () => {
                              const setup = [0.5, 0.5, 0.5, 0.5, 0.5];
                              setBiasParam(setupToBias(setup));
                              setCarSetup(setup);
                            }
                          }>Mid</Button>
                          <Button variant="contained" color="secondary" onClick={
                            () => {
                              const setup = [0, 0, 0, 0, 0];
                              setBiasParam(setupToBias(setup));
                              setCarSetup(setup);
                            }
                          }>Min</Button>
                          <Button variant="contained" color="error" onClick={
                            () => {
                              const setup = randomSetup();
                              setCarSetup(setup);
                              setBiasParam(setupToBias(setup));
                            }
                          }>Random</Button>
                          <div style={{ padding: 5 }}>
                            <Typography sx={{ color: "#777" }}>{possibleSetups} Setups Possible</Typography>
                          </div>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} lg={6}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'left' }}>
                        <Stack spacing={1} direction="row-reverse">
                          <Button variant="contained" color="error" onClick={
                            () => {
                              clearAll()
                            }
                          }>Clear History</Button>
                          <Button variant="contained" color="warning" onClick={
                            () => {
                              clearFeedbacks()
                            }
                          }>Clear Feedbacks</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ width: 120, fontSize: 18 }}><b>Feedback</b></TableCell>
                      <TableCell sx={{ minWidth: 360, fontSize: 18 }}><b>Bias</b></TableCell>
                      <TableCell sx={{ minWidth: 120, width: 120, fontSize: 18 }}>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      BiasParams.map(row => {
                        const feedbacks = feedback[row.index];
                        const biasValue = biasParam[row.index];
                        const k = row.name + ":" + target;
                        let currentFeedback = "";
                        for(const fb of feedbacks) {
                          if (fb.value === biasValue) {
                            currentFeedback = fb.feedback;
                          }
                        }
                        return [(
                          <TableRow key={k}>
                            <TableCell sx={{ pt: 0, pb: 0, pl: 1, pr: 1, borderBottom: '1px dashed rgba(81, 81, 81, .6)' }}>
                              <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                                <InputLabel id="demo-simple-select-standard-label">{row.name}</InputLabel>
                                <Select
                                  labelId="demo-simple-select-standard-label"
                                  component="label"
                                  label={row.name}
                                  value={currentFeedback}
                                  disabled={!isValidSetup.every(x => x)}
                                  onChange={(e) => {
                                    createFeedback(row, biasValue, e.target.value)
                                  }}
                                >
                                  <MenuItem value='optimal'>Optimal</MenuItem>
                                  <MenuItem value='great'>Great</MenuItem>
                                  <MenuItem value='good'>Good</MenuItem>
                                  <MenuItem value='bad'>Bad</MenuItem>
                                  <MenuItem value='bad+'>Bad (Too High)</MenuItem>
                                  <MenuItem value='bad-'>Bad (Too Low)</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ pt: 3, pb: 0, pl: 1, pr: 1, borderBottom: '1px dashed rgba(81, 81, 81, .6)' }}>
                              <Slider
                                max={1}
                                step={0.000001}
                                min={0}
                                valueLabelFormat={v => v.toFixed(6)}
                                valueLabelDisplay="on"
                                value={biasParam[row.index]}
                                onChange={(e, value) => {
                                  const bias = biasParam.map((x, idx) => idx === row.index ? value : x);
                                  setBiasParam(bias)
                                  setCarSetup(biasToSetup(bias))
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ pt: 0, pb: 0, pl: 1, pr: 1, borderBottom: '1px dashed rgba(81, 81, 81, .6)' }}>
                              <FormControl>
                                <TextField
                                  label={row.name}
                                  type="number"
                                  value={biasParamText[row.index]}
                                  variant="standard"
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  inputProps={{ inputMode: 'numeric', pattern: '[0-9.]*', step: 0.001 }}
                                  onChange={
                                    (e) => {
                                      const val = e.target.value;
                                      const nVal = Number(val);
                                      if (0 <= nVal && nVal <= 1) {
                                        const b = biasParam.map((x, idx) => idx === row.index ? nVal : x);
                                        setBiasParam(b)
                                        setCarSetup(biasToSetup(b))
                                      }
                                      setBiasParamText(
                                        biasParamText.map((x, idx) => idx === row.index ? val : x)
                                      )
                                    }
                                  }
                                />
                              </FormControl>
                            </TableCell>
                          </TableRow>
                        ),(
                          <TableRow key={`${k}_2`}>
                            <TableCell colSpan={3} sx={{ padding: 0.5 }}>
                              <Grid container spacing={1}>
                                {
                                  feedbacks.sort(
                                    (x, y) => x.value - y.value
                                  ).map((f, _idx) => (
                                    <Grid
                                      item
                                      key={_idx}
                                    >
                                      <Chip
                                        label={`${f.value.toFixed(4)}: ${f.feedback}`}
                                        color={feedbackColors[f.feedback]}
                                        onClick={() => {
                                          const bias = biasParam.map((x, idx) => idx === row.index ? f.value : x);
                                          setBiasParam(bias)
                                          setCarSetup(biasToSetup(bias))
                                        }}
                                        onDelete={() => {
                                          setFeedback(
                                            feedback.map((x, idx) => idx === row.index ?
                                              x.filter(x => x.value !== f.value) : x
                                            )
                                          )
                                        }}
                                      />
                                    </Grid>
                                  ))
                                }
                              </Grid>
                            </TableCell>
                          </TableRow>
                        )];
                      }).flat()
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} lg={12} sx={{ mt: 3 }}>
              <div style={{ display: 'flex', height: '100%' }}>
                <div style={{ flexGrow: 1 }}>
                  <DataGrid
                    autoHeight
                    rows={[
                      {
                        arr: prevCarSetup,
                        biasParams: prevBiasParam,
                        diff: 0,
                        id: 0,
                      },
                      ...carSetupList.map((x, id) => {
                        const biasParams = setupToBias(x.arr);
                        return {...x, biasParams, id: id + 1}
                      })
                    ]}
                    columns={[
                      {
                        field: 'id', headerName: 'Setup #',
                        renderCell : ({ row, value }) =>
                          <Button variant="contained" color={value ? "info" : "secondary"} sx={{ pt: 0.2, pb: 0.2, minWidth: 80 }} onClick={
                            () => {
                              setBiasParam(setupToBias(row.arr));
                              setCarSetup(row.arr);
                            }
                          }>{value ? "#" + value : "PRV"}</Button>
                      },
                      {
                        field: 'diff', headerName: '%',
                        valueGetter: ({ value }) => value.toFixed(1) + "%",
                      },
                      ...CarSetupParams.map(param => {
                        const idx = param.index;
                        return {
                          field: 'arr_' + idx,
                          headerName: param.name,
                          valueGetter: ({ row }) => row.arr ? row.arr[idx] : 0,
                          renderCell: ({ row }) => {
                            const value = row.arr ? row.arr[idx] : 0;
                            const carSetupDiff = value - (prevCarSetup ? prevCarSetup[idx] : 0);
                            return <Typography sx={{
                              fontSize: 13, p: 0.5, textAlign: "center",
                              color: carSetupDiff > 0 ? "#ff6383" : carSetupDiff < 0 ? "#76ff03" : "white" }}
                            >
                              {carSetupDiff > 0 ? "▲" : carSetupDiff < 0 ? "▼" : ""} {
                              param.render(value * (param.max - param.min) + param.min)
                            }</Typography>
                          },
                        }
                      }),
                      {
                        field: 'arr', headerName: '⇒',
                        width: 8,
                        renderCell: () => "⇒",
                      },
                      ...BiasParams.map(param => {
                        const idx = param.index;
                        return {
                          field: 'biasArr_' + idx,
                          headerName: param.name,
                          valueGetter: ({ row }) => row.biasParams ? row.biasParams[idx] : 0,
                          renderCell: ({ row }) => {
                            const value = row.biasParams ? row.biasParams[idx] : 0;
                            const carSetupDiff = value - (prevBiasParam ? prevBiasParam[idx] : 0);
                            return <Typography sx={{
                              fontSize: 13, p: 0.5, textAlign: "center",
                              color: carSetupDiff > 0 ? "#ff6383" : carSetupDiff < 0 ? "#76ff03" : "white" }}
                            >
                              {value.toFixed(4)} {carSetupDiff > 0 ? "▲" : carSetupDiff < 0 ? "▼" : ""}
                            </Typography>
                          },
                        }
                      })
                    ]}
                    density="compact"
                    rowsPerPageOptions={[10, 20, 40, 100, 200]}
                  />
                </div>
              </div>
            </Grid>
            <Grid item xs={12} lg={12} sx={{ mt: 5 }}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Previous Runs</b></TableCell>
                      <TableCell sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}><b>FWA</b></TableCell>
                      <TableCell sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}><b>RWA</b></TableCell>
                      <TableCell sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}><b>ARD</b></TableCell>
                      <TableCell sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}><b>TC</b></TableCell>
                      <TableCell sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}><b>TO</b></TableCell>
                      <TableCell sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}><b>Oversteer</b></TableCell>
                      <TableCell sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}><b>Braking</b></TableCell>
                      <TableCell sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}><b>Cornering</b></TableCell>
                      <TableCell sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}><b>Traction</b></TableCell>
                      <TableCell sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}><b>Straights</b></TableCell>
                      <TableCell sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      previousRuns.map(x => {
                        return (
                          <TableRow key={x.id}>
                            <TableCell sx={{ fontSize: 14, p: 0.5, pl: 2 }}>
                              <Image src={require(`../assets/flags/${x.track}.svg`)} width={24} height={20} alt={x.track} style={{ display: 'inline-block' }} />
                              <Typography sx={{ m: 0, ml: 1,  display: 'inline-block' }}>{trackMap[x.track]?.name}</Typography>
                            </TableCell>
                            {
                              [0, 1, 2, 3, 4].map(idx => (
                                <TableCell key={idx} sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}>{
                                  CarSetupParams[idx].render(
                                    x.carSetup[idx] * (
                                      CarSetupParams[idx].max - CarSetupParams[idx].min
                                    ) + CarSetupParams[idx].min
                                  )
                                }</TableCell>
                              ))
                            }
                            {
                              [0, 1, 2, 3, 4].map(idx => (
                                <TableCell key={idx} sx={{ fontSize: 14, p: 0.5, textAlign: "center" }}>
                                  {
                                    x["feedback_" + idx] && (
                                      <Chip
                                        label={`${x["feedback_" + idx].value.toFixed(4)}: ${x["feedback_" + idx].feedback}`}
                                        color={feedbackColors[x["feedback_" + idx].feedback]}
                                      />
                                    )
                                  }
                                </TableCell>
                              ))
                            }
                            <TableCell sx={{ textAlign: 'right', p: 0.5, pr: 2 }}>
                              <Stack spacing={1} direction="row-reverse">
                                <Button variant="contained" color="info" sx={{ minWidth: 32, p: 1 }}  onClick={
                                  () => {
                                    setBiasParam(setupToBias(x.carSetup));
                                    setCarSetup(x.carSetup);
                                  }
                                }>
                                  <OpenInNew />
                                </Button>
                                <Button variant="contained" color="error" sx={{ minWidth: 32, p: 1 }} onClick={
                                  () => {
                                    setPreviousRuns(previousRuns.filter(r => r.id !== x.id))
                                  }
                                }>
                                  <Delete />
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Container>
      </Container>
    )
  } catch (e) {
    console.log(e);
    // delete localStorage[target];
    // document.location.reload();
  }

}

export default function CalculatorPage() {
  const [tab, setTab] = useState(1);
  const [editText, setEditText] = useState("");
  const [openRenameId, setOpenRenameId] = useState(0);
  const totalSlots = 8;
  const preset = PresetSnapshot;

  let defaultSlots = Array.from(Array(totalSlots)).map((x, i) => ({
    id: i+1,
    slotNaming: `car_${i+1}`,
    slotTitle: `Slot ${i+1}`,
  }));

  try {
    const config = JSON.parse(localStorage.config)
    defaultSlots = config.slots;
  } catch (e) {
    console.log(e);
  }

  const [slots, setSlots] = useState(defaultSlots);

  if (typeof window !== "undefined") {
    localStorage.setItem("config", JSON.stringify({
      slots,
    }));
  }

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Container maxWidth="xl" component="main" sx={{ pt: 2, pb: 3 }}>

        <Dialog
          open={openRenameId > 0}
          onClose={() => {
            setSlots(slots.map(x => x.id === openRenameId ? {...x, slotTitle: editText} : x))
            setOpenRenameId(0);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Rename This Slot</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {
                openRenameId > 0 && (
                  <Input value={editText} onChange={e => setEditText(e.target.value)}/>
                )
              }
            </DialogContentText>
          </DialogContent>
        </Dialog>

        <Typography variant="h3" component="h3">F1 Manager Setup Calculator</Typography>
        <Divider variant="fullWidth" sx={{ mt: 2, mb: 2 }}/>
        <div>
          <div style={{ float: 'left' }} >
            <Typography sx={{ mt: 1, fontSize: 18 }}>
              Tutorial / Give award / Favourite: <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=2855732906">Steam Guide</a>
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 18 }}>
              Feedbacks / Bug Report: <a href="https://discord.gg/u46QWWaNfV">Discord</a>
            </Typography>
          </div>
          <div style={{ float: 'right' }} ><KofiButton kofiID='A0A8ERCTF' title="Support Me on Ko-fi" color='#29abe0' style={{ display: "none"}} /></div>
          <div style={{ clear: 'both' }} />
        </div>
        <Divider variant="fullWidth" sx={{ mt: 2 }} />
      </Container>
      <Container maxWidth="xl" component="main">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, f) => setTab(f)}>
            {
              slots.map(
                s => <Tab label={
                  <span>
                    {s.slotTitle}
                    <IconButton size="small" sx={{ ml: 1 }} onClick={() => {
                      setEditText(s.slotTitle);
                      setOpenRenameId(s.id);
                    }}>
                      <Edit />
                    </IconButton>
                  </span>
                } value={s.id} key={s.id}/>
              )
            }
          </Tabs>
        </Box>
        <div key={slots[tab].id}>
          <Calculator target={slots[tab].slotNaming} preset={preset} />
        </div>
      </Container>
      <Divider variant="fullWidth" />
      <Container  maxWidth="xl" component="main" sx={{ pt: 2, pb: 3 }}>
        <Typography>
          Another ieb Project &middot; {' '}
          GitHub: <a href="https://github.com/iebb/F1Manager-Calc">iebb/F1Manager-Calc</a> &middot; {' '}
          Contact: <a href="https://twitter.com/CyberHono">@CyberHono</a>
        </Typography>
      </Container>
    </SnackbarProvider>
  );
}
