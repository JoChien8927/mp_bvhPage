import { PoseAnalysisSelectionTypes } from "./pose-analysis-selection-types";
import { call, put, takeEvery } from "redux-saga/effects";
import { AlertAction } from "../alert/alert-action";
import { PoseAnalysisSelectionAction } from "./pose-analysis-selection-action";
import { getHeaders } from "../utils";

const LoadStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch(`/api/training_poses/${action.payload.mainPoseId}`, {
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
    yield put(
      PoseAnalysisSelectionAction.LoadFinish(
        action.payload.mainPoseId,
        json.trainingPose,
      ),
    );
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const GetAllPosesAvailableStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      const filter = encodeURIComponent(action.payload.filter);
      fetch(`/api/training_poses/analysis_avaialble?filter=${filter}`, {
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
    yield put(
      PoseAnalysisSelectionAction.GetAllPosesAvailableFinish(
        json.trainingPoses,
      ),
    );
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const NewAnalysisStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch("/api/training_analysis", {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          poses: action.payload.poses,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(
      PoseAnalysisSelectionAction.NewAnalysisFinish(
        json.trainingAnalysis,
        action.callback,
      ),
    );
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

export const PoseAnalysisSelectionSaga = function* () {
  yield takeEvery(PoseAnalysisSelectionTypes.LOAD_START, LoadStart);
  yield takeEvery(
    PoseAnalysisSelectionTypes.GET_ALL_AVAILABLE_START,
    GetAllPosesAvailableStart,
  );
  yield takeEvery(
    PoseAnalysisSelectionTypes.NEW_ANALYSIS_START,
    NewAnalysisStart,
  );
};
