import { TrainingAnalysisTypes } from "./training-analysis-types";

const GetStart = (analysisId) => ({
  type: TrainingAnalysisTypes.GET_START,
  payload: {
    analysisId: analysisId,
  },
});

const GetFinish = (trainingAnalysis) => ({
  type: TrainingAnalysisTypes.GET_FINISH,
  payload: {
    trainingAnalysis: trainingAnalysis,
  },
});

export const TrainingAnalysisAction = {
  GetStart,
  GetFinish,
};
