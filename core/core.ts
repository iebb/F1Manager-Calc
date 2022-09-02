import type { Bias, Setup, FeedbackEntry } from "./types";
import {
  eps,
  errorConst,
  MAX_SETUP_CANDIDATES,
  goodBreakpoint,
  greatBreakpoint,
  optimalBreakpoint,
} from "./consts";
import { BiasParams, CarSetupParams } from "../consts/params";

export const arrayFloatEqual = (a: number[], b: number[]): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (Math.abs(a[i] - b[i]) > eps) return false;
  }
  return true;
};

export const setupToBias = (carSetup: Setup): Bias => {
  return BiasParams.map(
    (biasRow) =>
      carSetup
        .map((x, idx) => x * biasRow.effect[idx])
        .reduce((a, b) => a + b) + biasRow.offset
  ) as Bias;
};

export const biasToSetup = (biasParam: Bias): Setup => {
  return CarSetupParams.map((carRow) =>
    biasParam
      .map((x, idx) => (x - BiasParams[idx].offset) * carRow.effect[idx])
      .reduce((a, b) => a + b)
  ) as Bias;
};

export const randomSetup = (): Setup =>
  CarSetupParams.map((params) => {
    const s = (params.max - params.min) / params.step;
    return Math.floor(Math.random() * (s + 1)) / s;
  }) as Setup;

type PossibleSetup = {
  arr: Setup;
  diff: number;
};

export type NearestSetupResult = {
  setup: Setup | null;
  lowestRuleBreak: number;
  possibleSetups: number;
  possibleSetupList: PossibleSetup[];
};

// Similar to Array.filter, true means no rule is being broken.
export const ruleCheck = (
  biasValue: number,
  feedback: FeedbackEntry
): boolean => {
  const dx = Math.abs(biasValue - feedback.value);
  switch (feedback.feedback) {
    case "bad":
      return dx > goodBreakpoint;
    case "bad+":
      return feedback.value - biasValue > goodBreakpoint;
    case "bad-":
      return feedback.value - biasValue < -goodBreakpoint;
    case "good":
      return dx < goodBreakpoint && dx > greatBreakpoint;
    case "great":
      return dx < greatBreakpoint && dx > optimalBreakpoint;
    case "optimal":
      return dx < optimalBreakpoint;
    case "unknown":
      return true;
  }
};

export const nearestSetup = (
  biasParam: Bias,
  feedbacks: FeedbackEntry[][]
): NearestSetupResult => {
  let nearestResult: Setup | null = null;
  let nearestDiff: number = errorConst;
  let lowestRuleBreak: number = 15;
  let possibleSetups: number = 0;
  let possibleSetupList: PossibleSetup[] = [];

  const _dfs = (v: number, arr: number[]): void => {
    if (v === CarSetupParams.length) {
      let _result = setupToBias(arr as Setup);
      let ruleBreaks = 0;
      for (let idx = 0; idx < 5; idx++) {
        const x = _result[idx];
        for (const fs of feedbacks[idx]) {
          if (!ruleCheck(x, fs)) {
            ruleBreaks += 1;
          }
        }
      }

      let diff = _result
        .map((x, idx) => {
          return Math.min(Math.abs(x - biasParam[idx]), 0.2) * 100;
        })
        .reduce((x, y) => x + y);

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
            nearestResult = arr as Setup;
          }
          possibleSetups++;

          if (
            possibleSetupList.length < MAX_SETUP_CANDIDATES ||
            diff < possibleSetupList[MAX_SETUP_CANDIDATES - 1].diff
          ) {
            possibleSetupList.push({ arr: arr as Setup, diff });
            possibleSetupList = possibleSetupList
              .sort((x, y) => x.diff - y.diff)
              .slice(0, MAX_SETUP_CANDIDATES);
          }
        }
      }

      return;
    }
    const params = CarSetupParams[v];
    const step = Math.round((params.max - params.min) / params.step);
    for (let i = 0; i <= step; i++) {
      _dfs(v + 1, [...arr, i / step]);
    }
  };
  _dfs(0, []);

  possibleSetupList = possibleSetupList
    .sort((x, y) => x.diff - y.diff)
    .slice(0, MAX_SETUP_CANDIDATES);
  // console.log(possibleSetupList);
  return {
    setup: nearestResult,
    possibleSetups,
    lowestRuleBreak,
    possibleSetupList,
  };
};
