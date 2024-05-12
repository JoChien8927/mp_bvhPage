import { ActionRecordingTypes } from "./action-recording-types";
import { createReducer } from "../utils";

const initialState = {
  analysisId: null,
  recordingId: null,
  show: true,
  recordingState: 0,

  cameraPosition: {
    x: 0,
    y: 0,
    z: 0,
  },

  thumbnails: [],

  currentRecordingStartedAt: null,
  previousRecordingLength: 0,
  previousRecordingFrames: 0,

  playbackActive: false,
  recordings: [],
  recordingsFramesEnd: -1,
  totalRecordings: -1,
  currentFrame: 0,
};

const init = () => {
  return {
    ...initialState,
  };
};

const ShowHideOptions = (state) => {
  return {
    ...state,
    show: !state.show,
  };
};

const NewRecordingFinish = (state, payload) => {
  return {
    ...state,
    analysisId: payload.recording.trainingAnalysis,
    recordingId: payload.recording._id,
    recordingState: 1,
    cameraPosition: {
      x: payload.cameraPosition.x,
      y: payload.cameraPosition.y,
      z: payload.cameraPosition.z,
    },
    cameraRotation: {
      _x: payload.cameraRotation._x,
      _y: payload.cameraRotation._y,
      _z: payload.cameraRotation._z,
    },
    currentRecordingStartedAt: Date.now(),
  };
};

const PauseRecording = (state) => {
  var miliseconds = Date.now() - state.currentRecordingStartedAt;
  var currentLength = Math.floor(miliseconds / 1000);
  var currentFrames = Math.floor(miliseconds / 30);

  return {
    ...state,
    recordingState: 2,
    previousRecordingLength: state.previousRecordingLength + currentLength,
    previousRecordingFrames: state.previousRecordingFrames + currentFrames,
    currentRecordingStartedAt: null,
  };
};

const StoreCameraPosition = (state, payload) => {
  return {
    ...state,
    cameraRotation: { ...payload.cameraRotation },
    cameraPosition: { ...payload.cameraPosition },
  };
};

const StoreThumbnailFinish = (state, payload) => {
  payload.thumbnail.type = "image";
  return {
    ...state,
    thumbnails: [...state.thumbnails, payload.thumbnail],
  };
};

const StoreVoiceNoteFinish = (state, payload) => {
  payload.voiceNote.type = "voiceNote";
  return {
    ...state,
    thumbnails: [...state.thumbnails, payload.voiceNote],
  };
};

const StoreCommentFinish = (state, payload) => {
  payload.comment.type = "comment";
  return {
    ...state,
    thumbnails: [...state.thumbnails, payload.comment],
  };
};

const StoreActionFinish = (state) => {
  return {
    ...state,
  };
};

const ObtainActionRecordingsFinish = (state, payload) => {
  return {
    ...state,
    playbackActive: true,
    recordings: state.recordings.concat(payload.recordings),
    recordingsFramesEnd: payload.recordingsFramesEnd,
    totalRecordings: payload.totalRecordings,
  };
};

const PlayActionFrame = (state) => {
  return { ...state, currentFrame: state.currentFrame + 1 };
};

export const ActionRecordingReducer = createReducer(initialState, {
  [ActionRecordingTypes.INIT]: init,
  [ActionRecordingTypes.SHOW_HIDE_OPTIONS]: ShowHideOptions,
  [ActionRecordingTypes.SHOW_HIDE_OPTIONS]: ShowHideOptions,
  [ActionRecordingTypes.NEW_RECORDING_FINISH]: NewRecordingFinish,
  [ActionRecordingTypes.PAUSE_RECORDING]: PauseRecording,
  [ActionRecordingTypes.STORE_ACTION_FINISH]: StoreActionFinish,
  [ActionRecordingTypes.STORE_CAMERA_POSITION]: StoreCameraPosition,
  [ActionRecordingTypes.STORE_THUMBNAIL_FINISH]: StoreThumbnailFinish,
  [ActionRecordingTypes.STORE_VOICE_NOTE_FINISH]: StoreVoiceNoteFinish,
  [ActionRecordingTypes.STORE_COMMENT_FINISH]: StoreCommentFinish,
  [ActionRecordingTypes.OBTAIN_ACTIONS_FINISH]: ObtainActionRecordingsFinish,
  [ActionRecordingTypes.PLAY_ACTION_FRAME]: PlayActionFrame,
});
