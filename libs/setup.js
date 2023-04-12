import {BiasParams, CarSetupParams} from "../consts/params";

export const MAX_SETUP_CANDIDATES = 999;
export const eps = 1e-6;
export const optimalBreakpoint = 0.007; // technically 39/5600 = 0.0069642857142857146 but fine
export const greatBreakpoint = 0.04 + eps;
export const goodBreakpoint = 0.1 + eps;

export const errorConst = 1e20;

export const arrayFloatEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (Math.abs(a[i] - b[i]) > eps) return false;
  }
  return true;
}

export const setupToBias = (carSetup) => {
  return BiasParams.map(biasRow =>
    carSetup.map(
      (x, idx) => x * biasRow.effect[idx]
    ).reduce((a,b) => a+b) + biasRow.offset
  )
}


export const biasToSetup = (biasParam) => {
  return CarSetupParams.map(carRow =>
    biasParam.map(
      (x, idx) => (x - BiasParams[idx].offset) * carRow.effect[idx]
    ).reduce((a,b) => a+b)
  )
}


export const nearestSetup = (biasParam, feedbacks) => {
  let nearestResult = null;
  let nearestDiff = errorConst;
  let lowestRuleBreak = 15;
  let possibleSetups = 0;
  let possibleSetupList = [];
  const _dfs = (v, arr) => {
    if (v === CarSetupParams.length) {
      let _result = setupToBias(arr);
      let ruleBreaks = 0;
      for (let idx = 0; idx < 5; idx++) {
        const x = _result[idx];
        for(const fs of feedbacks[idx]) {
          const dx = Math.abs(x - fs.value);
          const f = fs.feedback;
          // const scale = {bad: 1, good: 2, great: 3, optimal: 4}
          if (f !== "unknown") {
            if (
              (f === 'bad' && (dx < goodBreakpoint))
              ||
              (f === 'bad+' && (fs.value - x < goodBreakpoint))
              ||
              (f === 'bad-' && (fs.value - x > - goodBreakpoint))
              ||
              (f === 'good' && ((dx > goodBreakpoint) || (dx < greatBreakpoint)))
              ||
              (f === 'great' && ((dx > greatBreakpoint) || (dx < optimalBreakpoint)))
              ||
              (f === 'optimal' && (dx >= optimalBreakpoint))
            ) {
              ruleBreaks += 1;
            }
          }
        }
      }

      let diff = _result.map((x, idx) =>  {
        return (Math.min(Math.abs(x - biasParam[idx]), 0.2) * 100)
      }).reduce((x, y) => x+y)

      if (ruleBreaks < lowestRuleBreak - eps) {
        lowestRuleBreak = ruleBreaks;
        // console.log("lowestRuleBreak", lowestRuleBreak);
        possibleSetups = 0;
        nearestDiff = errorConst;
        nearestResult = null;
        possibleSetupList = [];
      }

      if (lowestRuleBreak === ruleBreaks) {
        if (diff < errorConst) {
          if (diff < nearestDiff) {
            nearestDiff = diff;
            nearestResult = arr;
          }
          possibleSetups++;

          if (
            possibleSetupList.length < MAX_SETUP_CANDIDATES ||
            diff < possibleSetupList[MAX_SETUP_CANDIDATES - 1].diff) {
            possibleSetupList.push({arr, diff});
            possibleSetupList = possibleSetupList.sort(
              (x, y) => x.diff - y.diff
            ).slice(0, MAX_SETUP_CANDIDATES)
          }

        }
      }

      return;
    }
    const params = CarSetupParams[v];
    const step = Math.round((params.max - params.min) / params.step);
    for(let i = 0; i <= step; i++) {
      _dfs(v+1, [...arr, i / step]);
    }
  }
  _dfs(0, []);

  possibleSetupList = possibleSetupList.sort((x, y) => x.diff - y.diff).slice(0, MAX_SETUP_CANDIDATES)
  return {setup: nearestResult, possibleSetups, lowestRuleBreak, possibleSetupList};
}


export const randomSetup = () => CarSetupParams.map(params => {
  const s = (params.max - params.min) / params.step;
  return Math.floor(Math.random() * (s + 1)) / s;
})

