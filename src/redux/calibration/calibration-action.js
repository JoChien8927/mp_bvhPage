import { CalibrationTypes } from "./calibration-types"

const calibrationImageSendStart = (cam, base64_1, base64_2, base64_3, base64_4) => ({
    type: CalibrationTypes.CALIBRATION_SEND_IMAGE_START,
    payload: {
        cam: cam,
        base64_1: base64_1,
        base64_2: base64_2,
        base64_3, base64_3,
        base64_4, base64_4
    },
});

const calibrationImageSendFinish = (message, calibration) =>({
    type: CalibrationTypes.CALIBRATION_SEND_IMAGE_FINISH,
    payload: {
        message: message,
        calibration: calibration
    }
});

const calibrationFail = (message) => ({
    type: CalibrationTypes.CALIBRATION_FAIL,
    payload: {
        message: message
    }  
})

const calibrationGetStart= () => ({
    type: CalibrationTypes.CALIBRATION_GET_ALL_START,
    payload: {

    }
})

const calibrationGetFinish = (calibrations) => ({
    type: CalibrationTypes.CALIBRATION_GET_ALL_FINISH,
    payload: {
        calibrations: calibrations
    }
})

const calibrationReset = () => ({
  type: CalibrationTypes.CALIBRATION_RESET,
  payload: {

  }
})

const calibrationIDStart = (_id) => ({
    type: CalibrationTypes.CALIBRATION_GET_ID_START,
    payload: {
        _id: _id
    }
})

const calibrationIDFinish = (cams) => ({
    type: CalibrationTypes.CALIBRATION_GET_ID_FINISH,
    payload: {
        cams: cams
    }
})

const calibrationDeleteStart =(_id) => ({
    type: CalibrationTypes.CALIBRATION_DELETE_START,
    payload:{
        _id: _id
    }
})

const calibrationDeleteFinish = (_id) => ({
    type: CalibrationTypes.CALIBRATION_DELETE_FINISH,
    payload:{
        _id: _id
    }
})

const calibrationPythonStart = (calibration_id) => ({
    type: CalibrationTypes.CALIBRATION_PYTHON_START,
    payload: {
        _id: calibration_id
    }
})

const calibrationPythonFinish = () => ({
    type: CalibrationTypes.CALIBRATION_PYTHON_FINISH,
    payload: {

    }
})

export const CalibrationAction = {
    calibrationImageSendStart,
    calibrationImageSendFinish,
    calibrationFail,
    calibrationReset,
    calibrationGetStart,
    calibrationGetFinish,
    calibrationIDStart,
    calibrationIDFinish,
    calibrationPythonStart,
    calibrationPythonFinish,
    calibrationDeleteStart,
    calibrationDeleteFinish
};
