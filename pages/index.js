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
  Slider,
  Stack,
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
  great: "primary",
  good: "success",
  bad: "danger",
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
  let nearestDiff = 1000000000;
  const _dfs = (v, arr) => {
    if (v === CarSetupParams.length) {
      let _result = setupToBias(arr);
      let diff = _result.map((x, idx) =>  {
        for(const fs of feedbacks[idx]) {
          const dx = Math.abs(x - fs.value);
          const f = fs.feedback;
          if (f !== "unknown") {
            if (f === 'bad' && (dx < 0.1)) {
              return 1000000000;
            }
            if (f === 'good' && (dx > 0.1 || dx < 0.04)) {
              return 1000000000;
            }
            if (f === 'great' && (dx > 0.04 || dx <= 0.005)) {
              return 1000000000;
            }
            if (f === 'optimal' && (dx > 0.005)) {
              return 1000000000;
            }
          }
        }
        return (Math.abs(x - biasParam[idx]) * 100) ** pow
      }).reduce((x, y) => x+y)
      if (diff < nearestDiff) {
        nearestDiff = diff;
        nearestResult = arr;
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
  return nearestResult;
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

  const clearFeedback = () => setFeedback([[], [], [], [], []]);

  return (
    <Container disableGutters maxWidth="xl">
      <Container maxWidth="xl" component="main" sx={{ pt: 12, pb: 4 }}>
        <Typography variant="h2" component="h2">F1 Manager Setup Calculator</Typography>
      </Container>
      <Divider variant="fullWidth" />
      <Container maxWidth="xl" component="main" sx={{ pt: 4, pb: 3 }}>
        <Grid container spacing={2}>
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
            <Button variant="contained" onClick={
              () => {
                const setup = nearestSetup(biasParam, 2, feedback);
                if (setup) {
                  setBiasParam(setupToBias(setup));
                  setCarSetup(setup);
                } else {
                  enqueueSnackbar(
                    'Unable to find a valid setup matching all feedbacks. Try deleting some feedbacks.',
                    { variant: "error" }
                  );
                }
              }
            }>Find Nearest</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={
              () => {
                clearFeedback()
              }
            }>Clear Feedback</Button>
          </Grid>
        </Grid>
      </Container>
      <Divider variant="fullWidth" />
      <Container  maxWidth="xl" component="main" sx={{ pt: 4, pb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 160, fontSize: 18 }}><b>Setup</b></TableCell>
                    <TableCell sx={{ minWidth: 360, fontSize: 18 }}><b>Values</b></TableCell>
                    <TableCell sx={{ fontSize: 18, textAlign: 'right' }}><b>Last Value</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    CarSetupParams.map(row => (
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
                        <TableCell sx={{ fontSize: 16, textAlign: 'right' }}>{
                          row.render(lastCarSetup[row.index] * (row.max - row.min) + row.min)
                        }</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Button variant="contained" color="error" onClick={
                        () => {
                          setCarSetup(lastCarSetup);
                          setBiasParam(setupToBias(lastCarSetup));
                        }
                      }>Load</Button>
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
                    <TableCell sx={{ minWidth: 360, fontSize: 18 }}><b>Bias Values</b></TableCell>
                    <TableCell sx={{ width: 180 }}></TableCell>
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
                                      ...x.filter(x => x.value !== biasValue), {value: biasValue, feedback: e.target.value}
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
                          <TableCell sx={{ pr: 6 }}>
                            <Slider
                              max={1}
                              step={0.0001}
                              min={0}
                              valueLabelFormat={v => v.toFixed(4)}
                              valueLabelDisplay="on"
                              value={biasParam[row.index]}
                              onChange={(e, value) => {
                                const bias = biasParam.map((x, idx) => idx === row.index ? value : x);
                                setBiasParam(bias)
                                setCarSetup(biasToSetup(bias))
                              }}
                            />
                            <Stack direction="row" spacing={1}>
                              {
                                feedbacks.map((f, _idx) => (
                                  <Chip
                                    label={`${f.value.toFixed(4)}: ${f.feedback}`}
                                    color={feedbackColors[f.feedback]}
                                    key={_idx}
                                    onClick={() => {
                                      const bias = biasParam.map((x, idx) => idx === row.index ? f.value : x);
                                      setBiasParam(bias)
                                      setCarSetup(biasToSetup(bias))
                                    }}
                                    onDelete={() => {
                                      setFeedback(
                                        feedback.map((x, idx) => idx === row.index ?
                                          x.filter(x => x.value !== biasValue) : x
                                        )
                                      )
                                    }}
                                  />
                                ))
                              }
                            </Stack>
                          </TableCell>
                          <TableCell>
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