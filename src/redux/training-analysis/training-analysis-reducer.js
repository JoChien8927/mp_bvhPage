import { createReducer } from "../utils";
import { TrainingAnalysisTypes } from "./training-analysis-types";

const initialState = {
  currentAnalysis: null,
};

const GetFinish = (state, payload) => ({
  ...state,
  currentAnalysis: payload.trainingAnalysis,
});

export const TrainingAnalysisReducer = createReducer(initialState, {
  [TrainingAnalysisTypes.GET_FINISH]: GetFinish,
});
