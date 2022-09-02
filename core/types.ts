export type Bias = [number, number, number, number, number];
export type Setup = [number, number, number, number, number];
export type Feedback = "unknown" | "bad" | "bad+" | "bad-" | "good" | "great" | "optimal";
export type FeedbackEntry = {
  value: number,
  timestamp: number,
  feedback: Feedback,
};
