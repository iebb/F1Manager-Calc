import { ruleCheck, setupToBias } from "./core";
import { Bias, FeedbackEntry, Setup } from "./types";

// Should the test fail, we want to see which bias this feedback relates to.
// And "dx" which all rule checks are based on.
type FeedbackEntryExt = FeedbackEntry & {
  biasIndex: number;
  dx: number;
};

test("Smoke test rule checker", () => {
  // Given
  const perfectSetup: Setup = [0.75, 0.21428571428571427, 0.25, 1, 0.05];
  const feedbacks: FeedbackEntry[][] = SAMPLE_JEDDAH_FEEDBACK;

  // When
  const perfectBias: Bias = setupToBias(perfectSetup);
  const failedFeedback: Set<FeedbackEntryExt> = new Set();
  for (let i = 0; i < perfectSetup.length; i++) {
    for (const feedback of feedbacks[i]) {
      if (!ruleCheck(perfectBias[i], feedback)) {
        failedFeedback.add({
          ...feedback,
          biasIndex: i,
          dx: perfectBias[i] - feedback.value,
        });
      }
    }
  }

  // Then
  expect(failedFeedback).toEqual(new Set());
});

const SAMPLE_JEDDAH_FEEDBACK: FeedbackEntry[][] = [
  [
    {
      value: 0.7721428571428572,
      timestamp: 1661958988380,
      feedback: "great",
    },
    {
      value: 0.7794642857142858,
      timestamp: 1661958963286,
      feedback: "great",
    },
    {
      value: 0.7892857142857144,
      timestamp: 1661962145929,
      feedback: "optimal",
    },
    {
      value: 0.7905357142857143,
      timestamp: 1661960550840,
      feedback: "optimal",
    },
    {
      value: 0.7967857142857144,
      timestamp: 1661960310770,
      feedback: "great",
    },
    {
      value: 0.8030357142857144,
      timestamp: 1661961153507,
      feedback: "great",
    },
    {
      value: 0.8092857142857144,
      timestamp: 1661959018380,
      feedback: "great",
    },
    {
      value: 0.8167857142857143,
      timestamp: 1661959040273,
      feedback: "great",
    },
    {
      value: 0.8230357142857143,
      timestamp: 1661959264299,
      feedback: "great",
    },
  ],
  [
    {
      value: 0.13276785714285705,
      timestamp: 1661958965909,
      feedback: "great",
    },
    {
      value: 0.13598214285714277,
      timestamp: 1661959597985,
      feedback: "optimal",
    },
    {
      value: 0.14035714285714285,
      timestamp: 1661962147310,
      feedback: "optimal",
    },
    {
      value: 0.14160714285714276,
      timestamp: 1661959042235,
      feedback: "optimal",
    },
    {
      value: 0.1428571428571428,
      timestamp: 1661959019800,
      feedback: "optimal",
    },
    {
      value: 0.15142857142857136,
      timestamp: 1661958990358,
      feedback: "great",
    },
    {
      value: 0.15160714285714277,
      timestamp: 1661960314372,
      feedback: "great",
    },
    {
      value: 0.1559821428571428,
      timestamp: 1661961150886,
      feedback: "great",
    },
    {
      value: 0.16723214285714277,
      timestamp: 1661960554560,
      feedback: "great",
    },
  ],
  [
    {
      value: 0.6591964285714287,
      timestamp: 1661960556717,
      feedback: "great",
    },
    {
      value: 0.6748214285714287,
      timestamp: 1661960318220,
      feedback: "great",
    },
    {
      value: 0.6854464285714286,
      timestamp: 1661961156453,
      feedback: "optimal",
    },
    {
      value: 0.6885714285714285,
      timestamp: 1661962148947,
      feedback: "optimal",
    },
    {
      value: 0.6898214285714286,
      timestamp: 1661959043821,
      feedback: "optimal",
    },
    {
      value: 0.6904464285714287,
      timestamp: 1661959585079,
      feedback: "optimal",
    },
    {
      value: 0.6910714285714286,
      timestamp: 1661959022599,
      feedback: "optimal",
    },
    {
      value: 0.7029464285714286,
      timestamp: 1661959269632,
      feedback: "great",
    },
    {
      value: 0.7283035714285715,
      timestamp: 1661958968425,
      feedback: "great",
    },
    {
      value: 0.7442857142857144,
      timestamp: 1661958991948,
      feedback: "good",
    },
  ],
  [
    {
      value: 0.11517857142857141,
      timestamp: 1661958970541,
      feedback: "good",
    },
    {
      value: 0.15857142857142856,
      timestamp: 1661959024631,
      feedback: "good",
    },
    {
      value: 0.18678571428571425,
      timestamp: 1661958994059,
      feedback: "great",
    },
    {
      value: 0.20732142857142855,
      timestamp: 1661959271602,
      feedback: "great",
    },
    {
      value: 0.21357142857142855,
      timestamp: 1661959045393,
      feedback: "optimal",
    },
    {
      value: 0.21482142857142855,
      timestamp: 1661961160367,
      feedback: "optimal",
    },
    {
      value: 0.21607142857142858,
      timestamp: 1661962150709,
      feedback: "optimal",
    },
    {
      value: 0.22107142857142856,
      timestamp: 1661960319745,
      feedback: "optimal",
    },
    {
      value: 0.22732142857142856,
      timestamp: 1661960559922,
      feedback: "great",
    },
  ],
  [
    {
      value: 0.5935714285714286,
      timestamp: 1661958997433,
      feedback: "bad",
    },
    {
      value: 0.6678571428571429,
      timestamp: 1661958972050,
      feedback: "good",
    },
    {
      value: 0.7221428571428572,
      timestamp: 1661959277620,
      feedback: "great",
    },
    {
      value: 0.7271428571428571,
      timestamp: 1661961163649,
      feedback: "optimal",
    },
    {
      value: 0.7321428571428572,
      timestamp: 1661962152067,
      feedback: "optimal",
    },
  ],
];
