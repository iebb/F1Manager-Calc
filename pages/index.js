import {
  Button,
  Container, Divider,
  Grid, IconButton,
  Paper,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {Lock} from "@mui/icons-material";
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


const nearestSetup = (biasParam, pow, lb) => {
  let nearestResult = null;
  let nearestDiff = 100;
  const _dfs = (v, arr) => {
    if (v === CarSetupParams.length) {
      let _result = setupToBias(arr);
      let diff = _result.map((x, idx) =>  (lb[idx] ? 10 : 1) * Math.abs(x - biasParam[idx]) ** pow).reduce((x, y) => x+y)
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

  const [carSetup, setCarSetup] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [biasParam, setBiasParam] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [lockedBias, setLockedBias] = useState([0, 0, 0, 0, 0]);

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
                setCarSetup(setup);
                setBiasParam(setupToBias(setup));
              }
            }>Min</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={
              () => {
                const setup = [0.5, 0.5, 0.5, 0.5, 0.5];
                setCarSetup(setup);
                setBiasParam(setupToBias(setup));
              }
            }>Mid</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={
              () => {
                const setup = [1, 1, 1, 1, 1];
                setCarSetup(setup);
                setBiasParam(setupToBias(setup));
              }
            }>Max</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={
              () => {
                const setup = nearestSetup(biasParam, 1, lockedBias);
                setCarSetup(setup);
                setBiasParam(setupToBias(setup));
              }
            }>Find Nearest</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={
              () => {
                const setup = nearestSetup(biasParam, 0.5, lockedBias);
                setCarSetup(setup);
                setBiasParam(setupToBias(setup));
              }
            }>Find Nearest (Squared)</Button>
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
                    <TableCell sx={{ maxWidth: 180, fontSize: 18 }}><b>Setup</b></TableCell>
                    <TableCell sx={{ minWidth: 360 }}><b>Values</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    CarSetupParams.map(row => (
                      <TableRow key={row.name}>
                        <TableCell sx={{ fontSize: 16 }}><b>{row.name}</b></TableCell>
                        <TableCell>
                          <div style={{ padding: "0 40px" }}>
                            <Slider
                              marks
                              color={carSetup[row.index] > 1 || carSetup[row.index] < 0 ? "error" : "primary"}
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
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} lg={6}>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ maxWidth: 180, fontSize: 18 }}><b>Bias</b></TableCell>
                    <TableCell sx={{ minWidth: 360 }}><b style={{float: 'left'}}>MIN</b><b style={{float: 'right'}}>MAX</b></TableCell>
                    <TableCell>🔒</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    BiasParams.map(row => (
                      <TableRow key={row.name}>
                        <TableCell sx={{ fontSize: 16 }}><b>{row.name}</b></TableCell>
                        <TableCell>
                          <div style={{ padding: "0 40px" }}>
                            <Slider
                              max={1}
                              step={0.001}
                              min={0}
                              valueLabelFormat={v => v.toFixed(3)}
                              valueLabelDisplay="on"
                              value={biasParam[row.index]}
                              onChange={(e, value) => {
                                const bias = biasParam.map((x, idx) => idx === row.index ? value : x);
                                setBiasParam(bias)
                                setCarSetup(biasToSetup(bias))
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell sx={{ padding: 0 }}>
                          <IconButton
                            color={lockedBias[row.index] ? "error" : "primary"}
                            component="label"
                            onClick={
                              () => setLockedBias(
                                lockedBias.map((x, idx) => idx === row.index ? !x : x)
                              )
                            }
                          >
                            <Lock />
                          </IconButton>
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
