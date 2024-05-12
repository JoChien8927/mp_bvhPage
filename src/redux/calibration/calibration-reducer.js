import { createReducer } from "../utils";
import { CalibrationTypes } from "./calibration-types";

const initialState = {
    status: 0,
    imageStatusMessage: "",
    calibrations: [],
    calibration: null,
    cams:[],
}

const calibrationGetAllFinish = (state, payload) => ({
    ...state,
    calibrations: payload.calibrations
})

const calibrationImageSendFinish = (state, payload) => ({
    ...state,
    status: 1,
    calibration: payload.calibration,
    imageStatusMessage: payload.message,
})

const calibrationDeleteFinish = (state, payload) => ({
    ...state,
    calibrations: state.calibrations.filter((calibration)=>{
        return(calibration._id !== payload._id)
    })
})

const calibrationFail = (state, payload) => ({
    ...state,
    status: -1 ,
    calibration: null,
    imageStatsMessage: payload.message
})

const calibrationReset = (state, payload) => ({
  ...state,
  status: 0,
  imageStatsMessage: ""
})

const calibrationIDFinish = (state, payload) => ({
    ...state,
    cams: payload.cams
})

const calibrationPythonFinish = (state, payload) => ({
    ...state,
    status: 2
})

export const CalibrationReducer = createReducer(initialState, {
    [CalibrationTypes.CALIBRATION_GET_ALL_FINISH]: calibrationGetAllFinish,
    [CalibrationTypes.CALIBRATION_SEND_IMAGE_FINISH]: calibrationImageSendFinish,
    [CalibrationTypes.CALIBRATION_FAIL]: calibrationFail,
    [CalibrationTypes.CALIBRATION_RESET]: calibrationReset,
    [CalibrationTypes.CALIBRATION_GET_ID_FINISH]: calibrationIDFinish,
    [CalibrationTypes.CALIBRATION_PYTHON_FINISH]: calibrationPythonFinish,
    [CalibrationTypes.CALIBRATION_DELETE_FINISH]: calibrationDeleteFinish
});