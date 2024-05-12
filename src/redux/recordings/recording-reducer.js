import { createReducer } from "../utils";
import { RecordingTypes } from "./recording-types";

const initialState = {
  show: true,
  /*
    -1: Error
     0: Recording, 
     1: Uploading Video
     2: video upload success, 
     3: mp4 conversion success
     4: 3D human pose estimation
  */
  recordingState: 0, 
  recording: null,
  recordings: [],
  err: ""
};

const recordingShowHideOptions = (state) => {
  return {
    ...state,
    show: !state.show,
  };
};

const recordingStop = (state, payload) => ({
  ...state,
  recording: payload.recording,
  recordingState: 2,
});

const getRecordingFromCalibrationFinish = (state, payload) =>({
  ...state,
  recordings: payload.recordings,
})

const recordingUpload = (state) => {
  return {
    ...state,
    recordingState: 1,
  };
};

const poseEstimationFinish = (state) => ({
  ...state,
  recordingState: 4
})

const getRecordingFinish = (state, payload) => ({
  ...state,
  recordings: payload.recordings
})

const deleteRecordingFinish = (state, payload) => ({
  ...state,
  recordings: state.recordings.filter((recording)=>{
    return(recording._id !== payload._id)
  })
})

const recordingErrorStart = (state, payload) => ({
  ...state,
  err: payload.err,
  recordingState: -1
})

const recordingErrorFinish = (state, payload) => ({
  ...state,
  show: true,
  recordingState: 0,
  recordings: [],
  err: ""
})

const recordConversionFinish = (state, payload) => ({
  ...state,
  recordingState: 3
})

export const RecordingReducer = createReducer(initialState, {
  [RecordingTypes.RECORDING_SHOW_HIDE_OPTIONS]: recordingShowHideOptions,
  [RecordingTypes.RECORDING_STOP]: recordingStop,
  [RecordingTypes.RECORDING_UPLOAD]: recordingUpload,
  [RecordingTypes.POSE_ESTIMATION_FINISH]: poseEstimationFinish,
  [RecordingTypes.GET_RECORDINGS_FINISH]: getRecordingFinish,
  [RecordingTypes.DELETE_RECORDING_FINISH]: deleteRecordingFinish,
  [RecordingTypes.GET_RECORDING_BASE_ON_CALIBRATION_FINISH]: getRecordingFromCalibrationFinish,
  [RecordingTypes.RECORDING_ERROR_START]: recordingErrorStart,
  [RecordingTypes.RECORDING_ERROR_FINISH]: recordingErrorFinish,
  [RecordingTypes.RECORDING_CONVERSION_FINISH]: recordConversionFinish
});
