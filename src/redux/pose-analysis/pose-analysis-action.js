import { PoseAnalysisTypes } from "./pose-analysis-types";

const GetPoseStart = (poseId) => ({
  type: PoseAnalysisTypes.GET_POSE_START,
  payload: {
    poseId: poseId,
  },
});

const GetPoseFinish = (pose) => ({
  type: PoseAnalysisTypes.GET_POSE_FINISH,
  payload: {
    pose: pose,
  },
});

// for edit and delete, cover whole data
const EditPoseStart=(pose,poseId)=>({
  type:PoseAnalysisTypes.EDIT_POSE_START,
  payload:{
    pose:pose,
    poseId:poseId
  }
})

// for edit and delete, cover whole data
const EditPoseFinish=(pose)=>({
  type:PoseAnalysisTypes.EDIT_POSE_FINISH,
  payload:{
    pose:pose
  }
})

export const PoseAnalysisAction = {
  GetPoseStart,
  GetPoseFinish,
  EditPoseStart,
  EditPoseFinish,
};
