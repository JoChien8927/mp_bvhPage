import { PoseAnalysisTypes } from "./pose-analysis-types";
import { createReducer } from "../utils";

const initialState = {
  currentPose: null,
  userId: null,
  poseId: null,
};

const GetPoseFinish = (state, payload) => {
  const pose = payload.pose;
  return {
    ...state,
    userId: pose.user._id,
    poseId: pose._id,
    currentPose: pose,
  };
};

// for edit and delete, cover whole data
const EditPoseFinish=(state,payload)=>{
  const pose = payload.pose;
  return {
    ...state,
    userId: pose.user._id,
    poseId: pose._id,
    currentPose: pose,
  };
}

export const PoseAnalysisReducer = createReducer(initialState, {
  [PoseAnalysisTypes.GET_POSE_FINISH]: GetPoseFinish,
  [PoseAnalysisTypes.EDIT_POSE_FINISH]:EditPoseFinish,
});
