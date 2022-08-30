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
import {BiasParams, CarSetupParams} from "../consts/params";
import {useEffect, useState} from "react";
import {SnackbarProvider, useSnackbar} from 'notistack';
import {trackMap, tracks} from "../consts/tracks";
import {Delete, OpenInNew} from "@mui/icons-material";

const feedbackColors = {
  optimal: "info",
  great: "primary",
  good: "white",
  bad: "error",
  "bad+": "error",
  "bad-": "error",
}

const optimalBreakpoint = 0.006;
const optimalBreakpoint2 = 0.0075;
const greatBreakpoint = 0.04;
const greatBreakpoint2 = 0.04;
const goodBreakpoint = 0.1;
const goodBreakpoint2 = 0.1;
const eps = 1e-5;
const errorConst = 1e20;

const arrayFloatEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (Math.abs(a[i] - b[i]) > eps) return false;
  }
  return true;
}

const setupToBias = (carSetup) => {
  return BiasParams.map(biasRow =>
    carSetup.map(
      (x, idx) => x * biasRow.effect[idx]
    ).reduce((a,b) => a+b) + biasRow.offset
  )
}


const biasToSetup = (biasParam) => {
  return CarSetupParams.map(carRow =>
    biasParam.map(
      (x, idx) => (x - BiasParams[idx].offset) * carRow.effect[idx]
    ).reduce((a,b) => a+b)
  )
}


const nearestSetup = (biasParam, pow, feedbacks) => {
  let nearestResult = null;
  let nearestDiff = errorConst;
  let lowestRuleBreak = 15;
  let possibleSetups = 0;
  const _dfs = (v, arr) => {
    if (v === CarSetupParams.length) {
      let _result = setupToBias(arr);
      let ruleBreaks = 0;
      for (let idx = 0; idx < 5; idx++) {
        const x = _result[idx];
        for(const fs of feedbacks[idx]) {
          const dx = Math.abs(x - fs.value);
          const f = fs.feedback;
          const scale = {bad: 1, good: 3, great: 6, optimal: 12}
          if (f !== "unknown") {
            if (
              (f === 'bad' && (dx < goodBreakpoint - eps))
              ||
              (f === 'bad+' && (fs.value < x + goodBreakpoint - eps))
              ||
              (f === 'bad-' && (fs.value > x - goodBreakpoint + eps))
              ||
              (f === 'good' && ((dx > goodBreakpoint2 + eps) || (dx < greatBreakpoint - eps)))
              ||
              (f === 'great' && ((dx > greatBreakpoint2 + eps) || (dx < optimalBreakpoint - eps)))
              ||
              (f === 'optimal' && (dx > optimalBreakpoint2 + eps))
            ) {
              ruleBreaks += scale[f];
            }
          }
        }
      }

      let diff = _result.map((x, idx) =>  {
        return (Math.abs(x - biasParam[idx]) * 100) ** pow
      }).reduce((x, y) => x+y)

      if (ruleBreaks < lowestRuleBreak - eps) {
        lowestRuleBreak = ruleBreaks;
        // console.log("lowestRuleBreak", lowestRuleBreak);
        possibleSetups = 0;
        nearestDiff = errorConst;
        nearestResult = null;
      }

      if (lowestRuleBreak === ruleBreaks) {
        if (diff < errorConst) {
          if (diff < nearestDiff) {
            nearestDiff = diff;
            nearestResult = arr;
          }
          possibleSetups++;
        }
      }
      return;
    }
    const params = CarSetupParams[v];
    const step = (params.max - params.min) / params.step;
    for(let i = 0; i <= step; i++) {
      _dfs(v+1, [...arr, i / step]);
    }
  }
  _dfs(0, []);
  return {setup: nearestResult, possibleSetups, lowestRuleBreak};
}


const randomSetup = () => CarSetupParams.map(params => {
  const s = (params.max - params.min) / params.step;
  return Math.floor(Math.random() * (s + 1)) / s;
})


export function Calculator({ target }) {

  const { enqueueSnackbar } = useSnackbar();

  const [isValidSetup, setIsValidSetup] = useState([true, true, true, true, true]);
  const [lastCarSetup, setLastCarSetup] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [carSetup, _setCarSetup] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [biasParam, _setBiasParam] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [biasParamText, setBiasParamText] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [feedback, setFeedback] = useState([[], [], [], [], []]);
  const [previousRuns, setPreviousRuns] = useState([]);
  const [possibleSetups, setPossibleSetups] = useState(952560);
  const [track, setTrack] = useState("XX");
  const [loaded, setLoaded] = useState(false);
  const [preset, setPreset] = useState({});
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
        feedback,
        previousRuns,
      } = JSON.parse(localStorage[target])
      setFeedback(feedback);
      _setBiasParam(biasParam);
      _setCarSetup(carSetup);
      setPreviousRuns(previousRuns || []);
      setTrack(track);
      setIsValidSetup(isValidSetup);
    } catch {
      setPreviousRuns([]);
      setTrack("XX");
    }
    fetch(`/stats/values`).then(r => r.json()).then(r => setPreset(r));
    setLoaded(true);
  }, [target])

  if (loaded && typeof window !== "undefined") {
    localStorage.setItem(target, JSON.stringify({
      isValidSetup,
      carSetup,
      biasParam,
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
    const {setup, possibleSetups, lowestRuleBreak} = nearestSetup(biasParam, 2, feedback);
    if (setup) {
      if (lowestRuleBreak > 0) {
        enqueueSnackbar(
          'Unable to find a valid setup matching all feedbacks. This is the closest we could get.',
          { variant: "warning" }
        );
        setPossibleSetups(0);
      } else {
        setPossibleSetups(possibleSetups);
      }
      setBiasParam(setupToBias(setup));
      setCarSetup(setup);
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

    if (v === "optimal" && Number(localStorage.c) > 6) {
      fetch(`/stats/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: getIdentifier(),
          track,
          value: biasValue,
          feedback: v,
          index: row.index,
        })
      });
    }
  }

  const loadPreset = () => {
    if (preset[track]) {
      const {setup} = nearestSetup(
        preset[track], 2, [[], [], [], [], []]
      );
      setBiasParam(setupToBias(setup));
      setCarSetup(setup);
    }
  }

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
                            {tracks.map(t => <MenuItem key={t.id} value={t.id}>{t.name}, {t.country}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </div>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Grid direction="row-reverse" container spacing={1}>
                        <Grid item>
                          <Button variant="contained" color="secondary" onClick={
                            () => {
                              clearFeedbacks()
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
                                const setup = carSetup.map((x, idx) => idx === row.index ? value : x);
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
                            <Typography sx={{ color: carSetupDiff > 0 ? "#ff1744" : carSetupDiff < 0 ? "#76ff03" : "white" }}>{carSetupDiff > 0 ? "▲" : carSetupDiff < 0 ? "▼" : ""} {
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
                      <Grid direction="row-reverse" container spacing={1}>
                        <Grid item>
                          <Button variant="contained" onClick={findNearest}>Find Nearest</Button>
                        </Grid>
                        <Grid item>
                          <Button variant="contained" color="secondary" onClick={
                            () => {
                              const setup = [1, 1, 1, 1, 1];
                              setBiasParam(setupToBias(setup));
                              setCarSetup(setup);
                            }
                          }>Max</Button>
                        </Grid>
                        <Grid item>
                          <Button variant="contained" color="secondary" onClick={
                            () => {
                              const setup = [0.5, 0.5, 0.5, 0.5, 0.5];
                              setBiasParam(setupToBias(setup));
                              setCarSetup(setup);
                            }
                          }>Mid</Button>
                        </Grid>
                        <Grid item>
                          <Button variant="contained" color="secondary" onClick={
                            () => {
                              const setup = [0, 0, 0, 0, 0];
                              setBiasParam(setupToBias(setup));
                              setCarSetup(setup);
                            }
                          }>Min</Button>
                        </Grid>
                        <Grid item>
                          <Button variant="contained" color="error" onClick={
                            () => {
                              const setup = randomSetup();
                              setCarSetup(setup);
                              setBiasParam(setupToBias(setup));
                            }
                          }>Random</Button>
                        </Grid>
                        <Grid item>
                          <div style={{ padding: 5 }}>
                            <Typography sx={{ color: "#777" }}>{possibleSetups} Setups Possible</Typography>
                          </div>
                        </Grid>
                      </Grid>
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
                          <TableCell sx={{ fontSize: 14, p: 0.5, pl: 2 }}>{trackMap[x.track]?.name}</TableCell>
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
}

export default function CalculatorPage() {
  const [tab, setTab] = useState(1);
  const slots = [1, 2, 3, 4, 5];
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Container maxWidth="xl" component="main" sx={{ pt: {
          xs: 2,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 6,
        }, pb: 3 }}>
        <Typography variant="h3" component="h3">F1 Manager Setup Calculator</Typography>
        <Divider variant="fullWidth" sx={{ mt: 2 }} />
      </Container>
      <Container maxWidth="xl" component="main">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, f) => setTab(f)}>
            {
              slots.map(
                s => <Tab label={`Slot #${s}`} value={s} key={s}/>
              )
            }
          </Tabs>
        </Box>
        {
          slots.map(
            s => <div style={tab !== s ? {display: 'none'} : null} key={s}>
              <Calculator target={`car_${s}`} key={s}/>
            </div>
          )
        }
      </Container>
      <Divider variant="fullWidth" />
      <Container  maxWidth="xl" component="main" sx={{ pt: 2, pb: 3 }}>
        <Typography sx={{ mt: 1 }}>
          How to use / How it works / Give award: <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=2855732906">Steam Guide</a>
        </Typography>
        <Divider variant="fullWidth" sx={{ mt: 2, mb: 2 }}/>
        <Typography>
          Another ieb Project &middot; {' '}
          GitHub: <a href="https://github.com/iebb/F1Manager-Calc">iebb/F1Manager-Calc</a> &middot; {' '}
          Contact: <a href="https://twitter.com/CyberHono">@CyberHono</a>
        </Typography>
      </Container>
    </SnackbarProvider>
  );
}
