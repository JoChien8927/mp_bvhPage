import { createReducer } from "../utils";
import { TrainingPosesTypes } from "./training-poses-types";

const initialState = {
  trainingPoses: [],
  processingRecording: false,
  processingVideoIds: [],
};

const TrainingPoseGetAllFinish = (state, payload) => ({
  ...state,
  trainingPoses: payload.trainingPoses,
});

const TrainingPoseCreateFinish = (state, payload) => ({
  ...state,
  trainingPoses: [...state.trainingPoses, Object.assign(payload.trainingPose)],
});

const TrainingPoseUploadFinish = (state, payload) => {
  const trainingPoses = state.trainingPoses;
  const index = trainingPoses.findIndex(
    (x) => x._id == payload.trainingPose._id,
  );
  trainingPoses[index] = Object.assign(payload.trainingPose);
  return {
    ...state,
    trainingPoses: trainingPoses,
  };
};

const TrainingPoseProcessFinish = (state, payload) => {
  const trainingPoses = state.trainingPoses;
  const index = trainingPoses.findIndex(
    (x) => x._id == payload.trainingPose._id,
  );
  trainingPoses[index] = Object.assign(payload.trainingPose);
  return {
    ...state,
    trainingPoses: trainingPoses,
  };
};
const TrainingPoseGetFinish = (state, payload) => ({
  ...state,
  current_session: payload.trainingPose,
  current_session_ref: payload.trainingPoseRef,
});

const TrainingPoseDeleteFinish = (state, payload) => ({
  ...state,
  trainingPoses: state.trainingPoses.filter((trainingPose) => {
    return trainingPose._id !== payload.trainingPoseId;
  }),
});

const TrainingRecordingStartFlag = (state, payload) => ({
  ...state,
  processingRecording: payload.processingRecording,
});

const TrainingPoseDeleteInProgressRecordingFinish = (state, payload) => ({
  ...state,
  processingRecording: false,
  current_session: payload.trainingPose,
  trainingPoses: state.trainingPoses.map((trainingPose) => {
    if (trainingPose._id === payload.trainingPose._id) {
      return Object.assign(trainingPose, {
        inProgressRecordings: payload.trainingPose.inProgressRecordings,
      });
    } else {
      return trainingPose;
    }
  }),
});

const TrainingPoseAddCommentFinish = (state, payload) => ({
  ...state,
  processingRecording: false,
  current_session: payload.trainingPose,
  trainingPoses: state.trainingPoses.map((trainingPose) => {
    if (trainingPose._id === payload.trainingPose._id) {
      return Object.assign(trainingPose, {
        inProgressRecordings: payload.trainingPose.inProgressRecordings,
      });
    } else {
      return trainingPose;
    }
  }),
});

const TrainingPoseEditCommentFinish = (state, payload) => ({
  ...state,
  processingRecording: false,
  current_session: payload.trainingPose,
  trainingPoses: state.trainingPoses.map((trainingPose) => {
    if (trainingPose._id === payload.trainingPose._id) {
      return Object.assign(trainingPose, {
        inProgressRecordings: payload.trainingPose.inProgressRecordings,
      });
    } else {
      return trainingPose;
    }
  }),
});

const TrainingPoseProcessRecordingFinish = (state, payload) => ({
  ...state,
  processingRecording: false,
  current_session: payload.trainingPose,
  trainingPoses: state.trainingPoses.map((trainingPose) => {
    if (trainingPose._id === payload.trainingPose._id) {
      return Object.assign(trainingPose, {
        inProgressRecordings: payload.trainingPose.inProgressRecordings,
      });
    } else {
      return trainingPose;
    }
  }),
});

const TrainingPoseSaveRecordingFinish = (state, payload) => ({
  ...state,
  processingRecording: false,
  current_session: payload.trainingPose,
  trainingPoses: state.trainingPoses.map((trainingPose) => {
    if (trainingPose._id === payload.trainingPose._id) {
      return Object.assign(trainingPose, {
        finalRecordings: payload.trainingPose.finalRecordings,
        inProgressRecordings: payload.trainingPose.inProgressRecordings,
      });
    } else {
      return trainingPose;
    }
  }),
});

const TrainingPoseUndoRecordingFinish = (state, payload) => ({
  ...state,
  processingRecording: false,
  current_session: payload.trainingPose,
  trainingPoses: state.trainingPoses.map((trainingPose) => {
    if (trainingPose._id === payload.trainingPose._id) {
      return Object.assign(trainingPose, {
        finalRecordings: payload.trainingPose.finalRecordings,
        inProgressRecordings: payload.trainingPose.inProgressRecordings,
      });
    } else {
      return trainingPose;
    }
  }),
});

const TrainingPoseOpenComment = (state, payload) => ({
  ...state,
  current_session: { ...payload.trainingPose },
});

export const TrainingPoseReducer = createReducer(initialState, {
  [TrainingPosesTypes.TRAINING_POSES_GET_ALL_FINISH]: TrainingPoseGetAllFinish,
  [TrainingPosesTypes.TRAINING_POSES_CREATE_FINISH]: TrainingPoseCreateFinish,
  [TrainingPosesTypes.TRAINING_POSES_UPLOAD_FINISH]: TrainingPoseUploadFinish,
  [TrainingPosesTypes.TRAINING_POSES_PROCESS_FINISH]: TrainingPoseProcessFinish,
  [TrainingPosesTypes.TRAINING_POSES_GET_FINISH]: TrainingPoseGetFinish,

  [TrainingPosesTypes.TRAINING_POSES_DELETE_FINISH]: TrainingPoseDeleteFinish,
  [TrainingPosesTypes.TRAINING_POSES_ADD_COMMENT_FINISH]:
    TrainingPoseAddCommentFinish,
  [TrainingPosesTypes.TRAINING_POSES_EDIT_COMMENT_FINISH]:
    TrainingPoseEditCommentFinish,
  [TrainingPosesTypes.TRAINING_POSES_POSE_RECORDING_START_FLAG]:
    TrainingRecordingStartFlag,
  [TrainingPosesTypes.TRAINING_POSES_DELETE_IN_PROGRESS_POSE_RECORDING_FINISH]:
    TrainingPoseDeleteInProgressRecordingFinish,
  [TrainingPosesTypes.TRAINING_POSES_PROCESS_POSE_RECORDING_FINISH]:
    TrainingPoseProcessRecordingFinish,
  [TrainingPosesTypes.TRAINING_POSES_SAVE_POSE_RECORDING_FINISH]:
    TrainingPoseSaveRecordingFinish,
  [TrainingPosesTypes.TRAINING_POSES_UNDO_POSE_RECORDING_FINISH]:
    TrainingPoseUndoRecordingFinish,
  [TrainingPosesTypes.TRAINING_POSES_OPEN_COMMENT]: TrainingPoseOpenComment,
});
