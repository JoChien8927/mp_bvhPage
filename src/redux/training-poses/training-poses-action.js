import { TrainingPosesTypes } from "./training-poses-types";

const TrainingPoseGetAllStart = (userId, filter, sortBy) => ({
  type: TrainingPosesTypes.TRAINING_POSES_GET_ALL_START,
  payload: {
    userId: userId || "",
    filter: filter || "",
    sortBy: sortBy | "",
  },
});

const TrainingPoseGetAllFinish = (trainingPoses) => ({
  type: TrainingPosesTypes.TRAINING_POSES_GET_ALL_FINISH,
  payload: {
    trainingPoses: trainingPoses,
  },
});

const TrainingPoseCreateStart = (
  userId,
  description,
  sportCategory,
  skillType,
  file,
  fileType,
) => ({
  type: TrainingPosesTypes.TRAINING_POSES_CREATE_START,
  payload: {
    userId: userId,
    description: description,
    sportCategory: sportCategory,
    skillType: skillType,
    file: file,
    fileType: fileType,
  },
});

const TrainingPoseCreateFinish = (trainingPose) => ({
  type: TrainingPosesTypes.TRAINING_POSES_CREATE_FINISH,
  payload: {
    trainingPose: trainingPose,
  },
});

const TrainingPoseUploadFinish = (trainingPose) => ({
  type: TrainingPosesTypes.TRAINING_POSES_UPLOAD_FINISH,
  payload: {
    trainingPose: trainingPose,
  },
});

const TrainingPoseProcessFinish = (trainingPose) => ({
  type: TrainingPosesTypes.TRAINING_POSES_PROCESS_FINISH,
  payload: {
    trainingPose: trainingPose,
  },
});

const TrainingPoseGetStart = (trainingPoseId, trainingPoseReferenceId) => ({
  type: TrainingPosesTypes.TRAINING_POSES_GET_START,
  payload: {
    trainingPoseId: trainingPoseId,
    trainingPoseReferenceId: trainingPoseReferenceId,
  },
});

const TrainingPoseGetFinish = (trainingPose, trainingPoseRef) => ({
  type: TrainingPosesTypes.TRAINING_POSES_GET_FINISH,
  payload: {
    trainingPose: trainingPose,
    trainingPoseRef: trainingPoseRef,
  },
});

const TrainingPoseDeleteStart = (userId, trainingPoseId) => ({
  type: TrainingPosesTypes.TRAINING_POSES_DELETE_START,
  payload: {
    userId: userId,
    trainingPoseId: trainingPoseId,
  },
});

const TrainingPoseDeleteFinish = (userId, trainingPoseId) => ({
  type: TrainingPosesTypes.TRAINING_POSES_DELETE_FINISH,
  payload: {
    userId: userId,
    trainingPoseId: trainingPoseId,
  },
});

const TrainingRecordingStartFlag = (processingRecording) => ({
  type: TrainingPosesTypes.TRAINING_POSES_POSE_RECORDING_START_FLAG,
  payload: {
    processingRecording: processingRecording,
  },
});

const TrainingPoseDeleteInProgressRecordingStart = (trainingPoseId) => ({
  type: TrainingPosesTypes.TRAINING_POSES_DELETE_IN_PROGRESS_POSE_RECORDING_START,
  payload: {
    trainingPoseId: trainingPoseId,
  },
});

const TrainingPoseDeleteInProgressRecordingFinish = (trainingPose) => ({
  type: TrainingPosesTypes.TRAINING_POSES_DELETE_IN_PROGRESS_POSE_RECORDING_FINISH,
  payload: {
    trainingPose: trainingPose,
  },
});

const TrainingPoseAddCommentStart = (userId, trainingPoseId, comment) => ({
  type: TrainingPosesTypes.TRAINING_POSES_ADD_COMMENT_START,
  payload: {
    userId: userId,
    trainingPoseId: trainingPoseId,
    comment: comment,
  },
});

const TrainingPoseAddCommentFinish = (trainingPose) => ({
  type: TrainingPosesTypes.TRAINING_POSES_ADD_COMMENT_FINISH,
  payload: {
    trainingPose: trainingPose,
  },
});

const TrainingPoseEditCommentStart = (trainingPoseId, comment) => ({
  type: TrainingPosesTypes.TRAINING_POSES_EDIT_COMMENT_START,
  payload: {
    trainingPoseId: trainingPoseId,
    comment: comment,
  },
});

const TrainingPoseEditCommentFinish = (trainingPose) => ({
  type: TrainingPosesTypes.TRAINING_POSES_EDIT_COMMENT_FINISH,
  payload: {
    trainingPose: trainingPose,
  },
});

const TrainingPoseProcessRecordingStart = (analysisId, file) => ({
  type: TrainingPosesTypes.TRAINING_POSES_PROCESS_POSE_RECORDING_START,
  payload: {
    analysisId: analysisId,
    file: file,
  },
});

const TrainingPoseProcessRecordingFinish = (trainingPose) => ({
  type: TrainingPosesTypes.TRAINING_POSES_PROCESS_POSE_RECORDING_FINISH,
  payload: {
    trainingPose: trainingPose,
  },
});

const TrainingPoseUndoRecordingStart = (userId, trainingPoseId) => ({
  type: TrainingPosesTypes.TRAINING_POSES_UNDO_POSE_RECORDING_START,
  payload: {
    trainingPoseId: trainingPoseId,
  },
});

const TrainingPoseUndoRecordingFinish = (trainingPose) => ({
  type: TrainingPosesTypes.TRAINING_POSES_UNDO_POSE_RECORDING_FINISH,
  payload: {
    trainingPose: trainingPose,
  },
});

const TrainingPoseSaveRecordingStart = (trainingPoseId) => ({
  type: TrainingPosesTypes.TRAINING_POSES_UPLOAD_POSE_RECORDING_START,
  payload: {
    trainingPoseId: trainingPoseId,
  },
});

const TrainingPoseSaveRecordingFinish = (trainingPose) => ({
  type: TrainingPosesTypes.TRAINING_POSES_SAVE_POSE_RECORDING_FINISH,
  payload: {
    trainingPose: trainingPose,
  },
});

const TrainingPoseOpenComment = (trainingPose) => ({
  type: TrainingPosesTypes.TRAINING_POSES_OPEN_COMMENT,
  payload: {
    trainingPose: trainingPose,
  },
});

export const TrainingPoseAction = {
  TrainingPoseGetAllStart,
  TrainingPoseGetAllFinish,
  TrainingPoseCreateStart,
  TrainingPoseCreateFinish,
  TrainingPoseUploadFinish,
  TrainingPoseProcessFinish,
  TrainingPoseGetStart,
  TrainingPoseGetFinish,
  TrainingPoseDeleteStart,
  TrainingPoseDeleteFinish,
  TrainingRecordingStartFlag,
  TrainingPoseDeleteInProgressRecordingStart,
  TrainingPoseDeleteInProgressRecordingFinish,
  TrainingPoseAddCommentStart,
  TrainingPoseAddCommentFinish,
  TrainingPoseEditCommentStart,
  TrainingPoseEditCommentFinish,
  TrainingPoseUndoRecordingStart,
  TrainingPoseUndoRecordingFinish,
  TrainingPoseSaveRecordingStart,
  TrainingPoseSaveRecordingFinish,
  TrainingPoseProcessRecordingStart,
  TrainingPoseProcessRecordingFinish,
  TrainingPoseOpenComment,
};
