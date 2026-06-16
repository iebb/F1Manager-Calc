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

      // Straights (bias 4) depends only on Front+Rear, so it is fully determined
      // here. Count its breaks once and carry the total down — any branch whose
      // partial break count already exceeds the best is impossible, so we prune it.
      const breaks4 = validateFeedbackBreaks(bias, feedbacks, lowestRuleBreak, [4]);
      if (breaks4 <= lowestRuleBreak) {

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

            // Oversteer (0) and Traction (3) don't depend on Toe-Out, so they are
            // determined here too. Accumulate with the Straights breaks counted above;
            // if the running total already exceeds the best, the whole Toe-Out loop
            // below is impossible and is skipped.
            const breaks03 = validateFeedbackBreaks(bias, feedbacks, lowestRuleBreak - breaks4, [0, 3]);
            const partialBreaks = breaks4 + breaks03;
            if (partialBreaks <= lowestRuleBreak) {

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

                  // Only Braking (1) and Cornering (2) change with Toe-Out — the
                  // other three were already counted in partialBreaks above.
                  const breaks12 = validateFeedbackBreaks(bias, feedbacks, lowestRuleBreak - partialBreaks, [1, 2]);
                  const ruleBreaks = partialBreaks + breaks12;
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

// --- Optimal-range indicator -------------------------------------------------
// For a single metric, the set of bias positions where the optimum can lie,
// derived from its feedbacks. Mirrors the consistency rules in
// validateFeedbackBreaks (a position is allowed iff it breaks no feedback).

const clampSet = (intervals) =>
  intervals
    .map(([a, b]) => [Math.max(0, a), Math.min(1, b)])
    .filter(([a, b]) => b - a > 1e-9);

// Allowed [lo,hi] intervals for the optimum given ONE feedback at fb.value.
const allowedIntervalsFor = (fb) => {
  const v = fb.value;
  const O = optimalBreakpoint, G = greatBreakpoint, D = goodBreakpoint;
  switch (fb.feedback) {
    case "optimal": return clampSet([[v - O, v + O]]);
    case "great":   return clampSet([[v - G, v - O], [v + O, v + G]]);
    case "good":    return clampSet([[v - D, v - G], [v + G, v + D]]);
    case "bad":     return clampSet([[0, v - D], [v + D, 1]]);
    case "bad+":    return clampSet([[0, v - D]]);
    case "bad-":    return clampSet([[v + D, 1]]);
    default:        return [[0, 1]]; // unknown / unrecognised -> no constraint
  }
};

const mergeSet = (intervals) => {
  if (intervals.length <= 1) return intervals;
  const sorted = [...intervals].sort((x, y) => x[0] - y[0]);
  const merged = [sorted[0].slice()];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i][0] <= last[1] + 1e-9) last[1] = Math.max(last[1], sorted[i][1]);
    else merged.push(sorted[i].slice());
  }
  return merged;
};

const intersectSets = (a, b) => {
  const out = [];
  for (const [a0, a1] of a) {
    for (const [b0, b1] of b) {
      const lo = Math.max(a0, b0), hi = Math.min(a1, b1);
      if (hi - lo > 1e-9) out.push([lo, hi]);
    }
  }
  return mergeSet(out);
};

// All bias positions for one metric consistent with EVERY feedback — i.e. where
// the optimum can lie. Returns a list of disjoint [lo,hi] ranges (possibly
// several, or none if the feedbacks are contradictory).
export const optimalRanges = (feedbacksForMetric) => {
  let ranges = [[0, 1]];
  for (const fb of feedbacksForMetric || []) {
    if (!fb || fb.feedback === "unknown") continue;
    ranges = intersectSets(ranges, allowedIntervalsFor(fb));
    if (ranges.length === 0) break;
  }
  return ranges;
};

export const randomSetup = () => CarSetupParams.map(params => {
  const s = (params.max - params.min) / params.step;
  return Math.floor(Math.random() * (s + 1)) / s;
})


