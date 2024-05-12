import { PoseAnalysisSelectionTypes } from "./pose-analysis-selection-types";
import { createReducer } from "../utils";
import { useHistory } from "react-router-dom";

const initialState = {
  analysisId: null,
  userId: null,
  mainPoseId: null,
  availablePoses: [],
  posesSelected: [],
};

const SelectPose = (state, payload) => {
  const posesSelected = state.posesSelected;
  const index = posesSelected.findIndex((x) => !x.isMain);

  posesSelected[index] = { ...payload.pose, index: index, isMain: false };

  return {
    ...state,
    posesSelected: [...posesSelected],
  };
};

const SwitchPosesOrder = (state) => {
  const posesSelected = state.posesSelected;

  var second = posesSelected.pop();
  posesSelected.splice(0, 0, second);
  posesSelected[0].index = 0;
  posesSelected[1].index = 1;

  return {
    ...state,
    posesSelected: [...posesSelected],
  };
};

const LoadFinish = (state, payload) => {
  return {
    ...state,
    analysisId: payload._id,
    userId: payload.userId,
    mainPoseId: payload.mainPoseId,
    mainPose: payload.mainPose,
    posesSelected: [
      { index: 0, isMain: false },
      { ...payload.mainPose, index: 1, isMain: true },
    ],
  };
};

const GetAllPosesAvailableFinish = (state, payload) => {
  const selected = state.posesSelected.map((x) => x._id);
  return {
    ...state,
    availablePoses: payload.trainingPoses.filter(
      (x) => !selected.includes(x._id),
    ),
  };
};

const NewAnalysisFinish = (state, payload) => {
  payload.callback(payload.trainingAnalysis._id);
  return {
    ...state,
    analysisId: payload.trainingAnalysis._id,
  };
};

export const PoseAnalysisSelectionReducer = createReducer(initialState, {
  [PoseAnalysisSelectionTypes.GET_ALL_AVAILABLE_FINISH]:
    GetAllPosesAvailableFinish,
  [PoseAnalysisSelectionTypes.LOAD_FINISH]: LoadFinish,
  [PoseAnalysisSelectionTypes.NEW_ANALYSIS_FINISH]: NewAnalysisFinish,
  [PoseAnalysisSelectionTypes.SELECT_POSE]: SelectPose,
  [PoseAnalysisSelectionTypes.SWITCH_POSE_ORDER]: SwitchPosesOrder,
});
