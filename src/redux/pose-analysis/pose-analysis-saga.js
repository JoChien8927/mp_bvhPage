import { PoseAnalysisTypes } from "./pose-analysis-types";
import { call, put, takeEvery } from "redux-saga/effects";
import { AlertAction } from "../alert/alert-action";
import { PoseAnalysisAction } from "./pose-analysis-action";
import { getHeaders } from "../utils";

const GetPoseStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch(`/api/training_poses/${action.payload.poseId}`, {
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
    yield put(PoseAnalysisAction.GetPoseFinish(json.trainingPose));
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

// for edit and delete, cover whole data
const EditPoseStart=function*(action){
  const task=()=>
  new Promise((resolve)=>{
    fetch(
      `/api/training_poses/${action.payload.poseId}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(action.payload.pose),
    })
    .then((response)=>response.json())
    .then((json)=>{
      resolve(json);
    });
  });
  const json=yield call(task);
  if(json.success){
    yield put(PoseAnalysisAction.EditPoseFinish(json.trainingPose));
  }else{
    yield put(AlertAction.alertStart("Error",json.message));
  }
};

export const PoseAnalysisSaga = function* () {
  yield takeEvery(PoseAnalysisTypes.GET_POSE_START, GetPoseStart);
  yield takeEvery(PoseAnalysisTypes.EDIT_POSE_START,EditPoseStart);
};
