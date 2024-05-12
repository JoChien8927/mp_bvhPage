import { PoseAnalysisSelectionTypes } from "./pose-analysis-selection-types";

const LoadStart = (mainPoseId) => ({
  type: PoseAnalysisSelectionTypes.LOAD_START,
  payload: {
    mainPoseId: mainPoseId,
  },
});

const LoadFinish = (mainPoseId, mainPose) => ({
  type: PoseAnalysisSelectionTypes.LOAD_FINISH,
  payload: {
    mainPoseId: mainPoseId,
    mainPose: mainPose,
  },
});

const SelectPose = (pose) => ({
  type: PoseAnalysisSelectionTypes.SELECT_POSE,
  payload: {
    pose: pose,
  },
});

const SwitchPosesOrder = () => ({
  type: PoseAnalysisSelectionTypes.SWITCH_POSE_ORDER,
  payload: {},
});

const GetAllPosesAvailableStart = (filter) => ({
  type: PoseAnalysisSelectionTypes.GET_ALL_AVAILABLE_START,
  payload: {
    filter: filter || "",
  },
});

const GetAllPosesAvailableFinish = (trainingPoses) => ({
  type: PoseAnalysisSelectionTypes.GET_ALL_AVAILABLE_FINISH,
  payload: {
    trainingPoses: trainingPoses,
  },
});

const NewAnalysisStart = (poses, callback) => ({
  type: PoseAnalysisSelectionTypes.NEW_ANALYSIS_START,
  payload: {
    poses: poses,
  },
  callback: callback,
});

const NewAnalysisFinish = (trainingAnalysis, callback) => ({
  type: PoseAnalysisSelectionTypes.NEW_ANALYSIS_FINISH,
  payload: {
    trainingAnalysis: trainingAnalysis,
    callback: callback,
  },
});

export const PoseAnalysisSelectionAction = {
  LoadStart,
  LoadFinish,
  SelectPose,
  SwitchPosesOrder,
  GetAllPosesAvailableStart,
  GetAllPosesAvailableFinish,
  NewAnalysisStart,
  NewAnalysisFinish,
};
