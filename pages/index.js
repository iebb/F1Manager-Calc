import {
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {BiasParams, CarSetupParams} from "../consts/params";
import {useState} from "react";


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
        const dx = Math.abs(x - biasParam[idx]);
        const f = feedbacks[idx];
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

          // console.log(f, dx);
        }
        return (dx * 100) ** pow
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

export default function Calculator() {

  const [isValidSetup, setIsValidSetup] = useState([true, true, true, true, true]);
  const [carSetup, setCarSetup] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [biasParam, setBiasParam] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [feedback, setFeedback] = useState(['unknown', 'unknown', 'unknown', 'unknown', 'unknown']);

  const clearFeedback = () => setFeedback(['unknown', 'unknown', 'unknown', 'unknown', 'unknown']);

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
                setIsValidSetup([true, true, true, true, true]);
                clearFeedback();
              }
            }>Random Setup</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={
              () => {
                const setup = [0, 0, 0, 0, 0];
                setCarSetup(setup);
                setBiasParam(setupToBias(setup));
                setIsValidSetup([true, true, true, true, true]);
                clearFeedback();
              }
            }>Min</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={
              () => {
                const setup = [0.5, 0.5, 0.5, 0.5, 0.5];
                setCarSetup(setup);
                setBiasParam(setupToBias(setup));
                setIsValidSetup([true, true, true, true, true]);
                clearFeedback();
              }
            }>Mid</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={
              () => {
                const setup = [1, 1, 1, 1, 1];
                setCarSetup(setup);
                setBiasParam(setupToBias(setup));
                setIsValidSetup([true, true, true, true, true]);
                clearFeedback();
              }
            }>Max</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={
              () => {
                const setup = nearestSetup(biasParam, 2, feedback);
                if (setup) {
                  setCarSetup(setup);
                  setBiasParam(setupToBias(setup));
                  setIsValidSetup([true, true, true, true, true]);
                  clearFeedback();
                }
              }
            }>Find Nearest</Button>
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
                                clearFeedback()
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell sx={{ fontSize: 16, textAlign: 'right' }}>{
                          row.render(carSetup[row.index] * (row.max - row.min) + row.min)
                        }</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} lg={6}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 120, fontSize: 18 }}><b>Feedback</b></TableCell>
                    <TableCell sx={{ minWidth: 360, fontSize: 18 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    BiasParams.map(row => (
                      <TableRow key={row.name}>
                        <TableCell sx={{ fontSize: 16, padding: 1 }}>
                          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="demo-simple-select-standard-label">{row.name}</InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              component="label"
                              label={row.name}
                              value={feedback[row.index]}
                              onChange={(e) => setFeedback(
                                feedback.map((x, idx) => idx === row.index ? e.target.value : x)
                              )}
                            >
                              <MenuItem value='unknown'>???</MenuItem>
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
                              setIsValidSetup([false, false, false, false, false])
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
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
