import { call, put, takeEvery } from "redux-saga/effects";
import { AlertAction } from "../alert/alert-action";
import { TrainingAnalysisAction } from "./training-analysis-action";
import { TrainingAnalysisTypes } from "./training-analysis-types";
import { getHeaders } from "../utils";

const GetStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch(`/api/training_analysis/${action.payload.analysisId}`, {
        method: "GET",
        headers: getHeaders(true),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(TrainingAnalysisAction.GetFinish(json.trainingAnalysis));
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

export const TrainingAnalysisSaga = function* () {
  yield takeEvery(TrainingAnalysisTypes.GET_START, GetStart);
};
