import { RecordingTypes } from "./recording-types";

const recordingShowHideOptions = () => ({
  type: RecordingTypes.RECORDING_SHOW_HIDE_OPTIONS,
  payload: {},
});

const recordingStop = (recording) => ({
  type: RecordingTypes.RECORDING_STOP,
  payload: {
    recording: recording
  },
});

const recordingStart = (formData, calibration_id) => ({
  type: RecordingTypes.RECORDING_START,
  payload: {
    formData: formData,
    calibration_id: calibration_id
  },
});

const recordingUpload = () => ({
  type: RecordingTypes.RECORDING_UPLOAD,
})

const poseEstimationStart = (calibration_id, recording_id) => ({
  type: RecordingTypes.POSE_ESTIMATION_START,
  payload: {
    calibration_id: calibration_id,
    recording_id: recording_id
  }
})

const poseEstimationFinish = () =>({
  type: RecordingTypes.POSE_ESTIMATION_FINISH
})

const getRecordingStart = (_id) => ({
  type: RecordingTypes.GET_RECORDINGS_START,
  payload:{
    _id: _id
  }
})

const getRecordingFinish = (recordings) => ({
  type: RecordingTypes.GET_RECORDINGS_FINISH,
  payload:{
    recordings: recordings
  }
})

const deleteRecordingStart = (_id) => ({
  type:RecordingTypes.DELETE_RECORDING_START,
  payload: {
    _id: _id
  }
})

const deleteRecordingFinish = (_id) => ({
  type: RecordingTypes.DELETE_RECORDING_FINISH,
  payload: {
    _id: _id
  }
})

const getRecordingFromCalibrationStart = (calibration_id) => ({
  type: RecordingTypes.GET_RECORDING_BASE_ON_CALIBRATION_START,
  payload:{
    calibration_id: calibration_id
  }
})

const getRecordingFromCalibrationFinish = (recordings) => ({
  type: RecordingTypes.GET_RECORDING_BASE_ON_CALIBRATION_FINISH,
  payload:{
    recordings: recordings
  }
})

const recordingErrorStart = (err) => ({
  type: RecordingTypes.RECORDING_ERROR_START,
  payload:{
    err: err
  }
})

const recordingErrorFinish = () => ({
  type: RecordingTypes.RECORDING_ERROR_FINISH,
  payload:{}
})

const recordConversionStart = (calibration_id, recording_id, idx) => ({
  type: RecordingTypes.RECORDING_CONVERSION_START,
  payload:{
    calibration_id: calibration_id,
    recording_id: recording_id,
    idx: idx
  }
})

const recordConversionFinish = () => ({
  type: RecordingTypes.RECORDING_CONVERSION_FINISH,
})

export const RecordingActions = {
  recordingShowHideOptions,
  recordingStop,
  recordingStart,
  poseEstimationStart,
  poseEstimationFinish,
  getRecordingStart,
  getRecordingFinish,
  deleteRecordingStart,
  deleteRecordingFinish,
  getRecordingFromCalibrationStart,
  getRecordingFromCalibrationFinish,
  recordingErrorStart,
  recordingErrorFinish,
  recordConversionStart,
  recordConversionFinish,
  recordingUpload
};
