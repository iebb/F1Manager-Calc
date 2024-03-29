import {BiasParams, CarSetupParams} from "../consts/params";

export const MAX_SETUP_CANDIDATES = 99;
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
  try {
    return BiasParams.map(biasRow => {
        const r = carSetup.map(
          (x, idx) => x * biasRow.effect[idx]
        ).reduce((a,b) => a+b) + biasRow.offset;
        return Math.round(r * 56000) / 56000;
      }
    )
  } catch {
    return [0.5, 0.5, 0.5, 0.5, 0.5];
  }
}


export const biasToSetup = (biasParam) => {
  try {
    return CarSetupParams.map(carRow =>
      biasParam.map(
        (x, idx) => (x - BiasParams[idx].offset) * carRow.effect[idx]
      ).reduce((a,b) => a+b)
    )
  } catch {
    return [0.5, 0.5, 0.5, 0.5, 0.5];
  }
}


export const validateFeedbackBreaks = (_result, feedbacks, maxBreaks, validates = [0, 1, 2, 3, 4]) => {
  let ruleBreaks = 0;
  for (const idx of validates) {
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
          if (ruleBreaks > maxBreaks) {
            return ruleBreaks;
          }
        }
      }
    }
  }
  return ruleBreaks;
}

export const nearestSetup = (
  biasParam,
  feedbacks,
  vConstraint= [[0,1],[0,1],[0,1],[0,1],[0,1]],
  fConstraint= [[0,1],[0,1],[0,1],[0,1],[0,1]]
) => {
  let nearestResult = null;
  let nearestDiff = errorConst;
  let lowestRuleBreak = 15;
  let possibleSetups = 0;
  let possibleSetupList = [];

  const steps = CarSetupParams.map(x => Math.round((x.max - x.min) / x.step));


  let si = [0, 0, 0, 0, 0];
  let v = [0, 0, 0, 0, 0];

  let bias = BiasParams.map(x => x.offset);

  for(si[0] = 0; si[0] <= steps[0]; si[0]++) {
    v[0] = si[0] / steps[0];
    if (v[0] + eps < vConstraint[0][0] || v[0] - eps > vConstraint[0][1]) {
      continue;
    }

    for(let i= 0; i < 5; i++) bias[i] += BiasParams[i].effect[0] * v[0];
    for(si[1] = 0; si[1] <= steps[1]; si[1]++) {
      v[1] = si[1] / steps[1];
      if (v[1] + eps < vConstraint[1][0] || v[1] - eps > vConstraint[1][1]) {
        continue;
      }
      for(let i= 0; i < 5; i++) bias[i] += BiasParams[i].effect[1] * v[1];

      // maybe we can do something here
      // straights are already determined here. validate 4 only

      const ruleBreaks = validateFeedbackBreaks(bias, feedbacks, lowestRuleBreak, [4]);
      if (ruleBreaks <= lowestRuleBreak) { // added guards

        for(si[2] = 0; si[2] <= steps[2]; si[2]++) {
          v[2] = si[2] / steps[2];
          if (v[2] + eps < vConstraint[2][0] || v[2] - eps > vConstraint[2][1]) {
            continue;
          }

          for(let i= 0; i < 5; i++) bias[i] += BiasParams[i].effect[2] * v[2];
          for(si[3] = 0; si[3] <= steps[3]; si[3]++) {
            v[3] = si[3] / steps[3];
            if (v[3] + eps < vConstraint[3][0] || v[3] - eps > vConstraint[3][1]) {
              continue;
            }

            for(let i= 0; i < 5; i++) bias[i] += BiasParams[i].effect[3] * v[3];

            // maybe we can do something here
            // toe-out only affects breaking and cornering, so let's validate [0, 3, 4]

            const ruleBreaks = validateFeedbackBreaks(bias, feedbacks, lowestRuleBreak, [0, 3]); // 4 doesn't need to revalidate
            if (ruleBreaks <= lowestRuleBreak) { // added guards

              for(si[4] = 0; si[4] <= steps[4]; si[4]++) {
                v[4] = si[4] / steps[4];
                if (v[4] + eps < vConstraint[4][0] || v[4] - eps > vConstraint[4][1]) {
                  continue;
                }

                for(let i= 0; i < 5; i++) {
                  bias[i] += BiasParams[i].effect[4] * v[4];
                  bias[i] = Math.round(bias[i] * 56000) / 56000;
                }

                let constraint = false;
                for(let i= 0; i < 5; i++) {
                  if (bias[i] + eps < fConstraint[i][0] || bias[i] - eps > fConstraint[i][1]) {
                    constraint = true;
                  }
                }

                if (!constraint) {

                  const ruleBreaks = validateFeedbackBreaks(bias, feedbacks, lowestRuleBreak);
                  if (ruleBreaks <= lowestRuleBreak) {
                    if (ruleBreaks < lowestRuleBreak) {
                      lowestRuleBreak = ruleBreaks;
                      possibleSetups = 0;
                      nearestDiff = errorConst;
                      nearestResult = null;
                      possibleSetupList = [];
                    }


                    const arr = [...v];
                    let diff = bias.map((x, idx) =>  {
                      return (Math.min(Math.abs(x - biasParam[idx]), 0.2) * 100)
                    }).reduce((x, y) => x+y)

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

                }

                for(let i= 0; i < 5; i++) bias[i] -= BiasParams[i].effect[4] * v[4];
              }

            }
            for(let i= 0; i < 5; i++) bias[i] -= BiasParams[i].effect[3] * v[3];
          }
          for(let i= 0; i < 5; i++) bias[i] -= BiasParams[i].effect[2] * v[2];
        }

      }

      for(let i= 0; i < 5; i++) bias[i] -= BiasParams[i].effect[1] * v[1];
    }
    for(let i= 0; i < 5; i++) bias[i] -= BiasParams[i].effect[0] * v[0];
  }

  possibleSetupList = possibleSetupList.sort((x, y) => x.diff - y.diff).slice(0, MAX_SETUP_CANDIDATES)
  return {setup: nearestResult, possibleSetups, lowestRuleBreak, possibleSetupList};
}

export const randomSetup = () => CarSetupParams.map(params => {
  const s = (params.max - params.min) / params.step;
  return Math.floor(Math.random() * (s + 1)) / s;
})


