import {
  Button,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider, Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {BiasParams, CarSetupParams} from "../consts/params";
import {useState} from "react";
import {SnackbarProvider, useSnackbar} from 'notistack';

const feedbackColors = {
  optimal: "info",
  great: "success",
  good: "primary",
  bad: "error",
}

const optimalBreakpoint = 0.006;
const optimalBreakpoint2 = 0.008;
const greatBreakpoint = 0.04;
const greatBreakpoint2 = 0.055;
const goodBreakpoint = 0.1;
const goodBreakpoint2 = 0.12;
const eps = 1e-5;
const errorConst = 1e20;


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
  let lowestRuleBreak = 1e20;
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
              (f === 'good' && ((dx > goodBreakpoint2 + eps) || (dx < greatBreakpoint - eps)))
              ||
              (f === 'great' && ((dx > greatBreakpoint2 + eps) || (dx < optimalBreakpoint - eps)))
              ||
              (f === 'optimal' && (dx > optimalBreakpoint2 + eps))
            ) {
              ruleBreaks += fs.timestamp * scale[f];
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


export function Calculator() {

  const { enqueueSnackbar } = useSnackbar();

  const [isValidSetup, setIsValidSetup] = useState([true, true, true, true, true]);
  const [lastCarSetup, setLastCarSetup] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [carSetup, _setCarSetup] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [biasParam, _setBiasParam] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [biasParamText, setBiasParamText] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [feedback, setFeedback] = useState([[], [], [], [], []]);
  const [possibleSetups, setPossibleSetups] = useState(952560);

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
    const {setup, possibleSetups} = nearestSetup(biasParam, 2, feedback);
    if (setup) {
      setBiasParam(setupToBias(setup));
      setCarSetup(setup);
      setPossibleSetups(possibleSetups);
    } else {
      enqueueSnackbar(
        'Unable to find a valid setup matching all feedbacks. Try deleting some feedbacks.',
        { variant: "error" }
      );
    }
  }

  const clearFeedback = () => setFeedback([[], [], [], [], []]);

  return (
    <Container disableGutters maxWidth="xl">
      <Container maxWidth="xl" component="main" sx={{ pt: {
          xs: 2,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 6,
        }, pb: 3 }}>
        <Typography variant="h3" component="h3">F1 Manager Setup Calculator</Typography>
      </Container>
      <Divider variant="fullWidth" />
      <Container maxWidth="xl" component="main" sx={{ pt: 2, pb: 2 }}>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained" color="warning" onClick={
              () => {
                clearFeedback()
              }
            }>Clear Feedback</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="error" onClick={
              () => {
                const setup = randomSetup();
                setCarSetup(setup);
                setBiasParam(setupToBias(setup));
              }
            }>Random Setup</Button>
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
                const setup = [1, 1, 1, 1, 1];
                setBiasParam(setupToBias(setup));
                setCarSetup(setup);
              }
            }>Max</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={findNearest}>Find Nearest</Button>
          </Grid>
        </Grid>
      </Container>
      <Container maxWidth="xl" component="main" sx={{ pt: 2, pb: 2 }}>
        <Typography>
          Usage: <br/>
          1. Pick your Current Practice Setup on the Left, and choose corresponding feedbacks after the run. <br/>
          2. Click &quot;FIND NEAREST&quot; to get a suggested setup, and repeat.
        </Typography>
      </Container>
      <Divider variant="fullWidth" />
      <Container maxWidth="xl" component="main" sx={{ pt: 2, pb: 6 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
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
                            <div>
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
                            </div>
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
                      <Stack direction="row-reverse" spacing={1}>
                        {
                          /*

                        <Button variant="contained" color="error" onClick={
                          () => {
                            setCarSetup(lastCarSetup);
                            setBiasParam(setupToBias(lastCarSetup));
                          }
                        }>Reset</Button>
                           */
                        }
                        <Button variant="contained" onClick={findNearest}>Find Nearest</Button>
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
                    <TableCell sx={{ width: 120, fontSize: 18 }}><b>Feedback</b></TableCell>
                    <TableCell sx={{ minWidth: 360, fontSize: 18 }}><b>Bias</b></TableCell>
                    <TableCell sx={{ minWidth: 150, width: 150, fontSize: 18 }}>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    BiasParams.map(row => {
                      const feedbacks = feedback[row.index];
                      const biasValue = biasParam[row.index];
                      let currentFeedback = "";
                      for(const fb of feedbacks) {
                        if (fb.value === biasValue) {
                          currentFeedback = fb.feedback;
                        }
                      }
                      return (
                        <>
                          <TableRow key={row.name}>
                            <TableCell sx={{ fontSize: 16, padding: 1 }}>
                              <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                                <InputLabel id="demo-simple-select-standard-label">{row.name}</InputLabel>
                                <Select
                                  labelId="demo-simple-select-standard-label"
                                  component="label"
                                  label={row.name}
                                  value={currentFeedback}
                                  disabled={!isValidSetup.every(x => x)}
                                  onChange={(e) => {
                                    setLastCarSetup(carSetup)
                                    setFeedback(
                                      feedback.map((x, idx) => idx === row.index ? [
                                        ...x.filter(x => x.value !== biasValue), {
                                          value: biasValue,
                                          timestamp: +new Date(),
                                          feedback: e.target.value
                                        }
                                      ]: x)
                                    )
                                  }}
                                >
                                  <MenuItem value='optimal'>Optimal</MenuItem>
                                  <MenuItem value='great'>Great</MenuItem>
                                  <MenuItem value='good'>Good</MenuItem>
                                  <MenuItem value='bad'>Bad</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ pt: 1, pb: 0 }}>
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
                            <TableCell sx={{ padding: 1 }}>
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
                          <TableRow key={row.name + "_"}>
                            <TableCell colSpan={3} sx={{ padding: 0.5 }}>
                              <Grid container spacing={1}>
                                {
                                  feedbacks.sort((x, y) => x.value - y.value).map((f, _idx) => (
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
                        </>
                      )
                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
      <Divider variant="fullWidth" />
      <Container  maxWidth="xl" component="main" sx={{ pt: 4, pb: 3 }}>
        <Typography>
          Another ieb Project &middot; {' '}
          GitHub: <a href="https://github.com/iebb/F1Manager-Calc">iebb/F1Manager-Calc</a> &middot; {' '}
          Contact: <a href="https://twitter.com/CyberHono">@CyberHono</a>
        </Typography>
      </Container>
    </Container>
  )
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Calculator />
    </SnackbarProvider>
  );
}