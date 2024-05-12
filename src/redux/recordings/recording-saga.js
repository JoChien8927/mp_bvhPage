import { RecordingActions } from "./recording-action";

import { call, put, takeEvery } from "redux-saga/effects";
const { RecordingTypes } = require("./recording-types");
import { getHeaders } from "../utils";

const recordingStart = function* (action) {
	console.log("1")
	const task = () => new Promise((resolve, reject)=>{
		fetch("/api/upload/recordings/"+action.payload.calibration_id,{
			method: "POST",
			body: action.payload.formData,
			// headers: {
			// 	'Content-Type': 'multipart/form-data'
			// },
		}).then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
	})
	const json = yield call(task);
	if(json.success){
		yield put(RecordingActions.recordingStop(json.recording))
	}
	else yield put(RecordingActions.recordingErrorStart(json.message))
}

const getRecordingStart = function * (action) {
	const task = () => new Promise((resolve)=>{
		fetch("/api/recording/all", {
			method: "GET",
			headers: getHeaders(true),
		}).then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
	})
	const json = yield call(task);
	if(json.success) yield put(RecordingActions.getRecordingFinish(json.recordings))
	else yield put(RecordingActions.recordingErrorStart(json.message))
}

const getRecordingFromCalibrationStart = function * (action) {
	const task = () => new Promise((resolve)=>{
		fetch("/api/recordings/get/"+action.payload.calibration_id, {
			method: "GET",
			headers: getHeaders(true),
		}).then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
	})
	const json = yield call(task);
	if(json.success) yield put(RecordingActions.getRecordingFromCalibrationFinish(json.recordings))
	else yield put(RecordingActions.recordingErrorStart(json.message))
}

const poseEstimationStart = function* (action) {
	const task = () => new Promise((resolve)=>{
		fetch("/api/video2bvh", {
			method: "POST",
			body: JSON.stringify({"calibration_id": action.payload.calibration_id, "recording_id": action.payload.recording_id}),
			headers: getHeaders(true)
		}).then((response)=>response.json()).then((json)=>{
			resolve(json)
		})
	})
	const json = yield call(task);
	console.log(json)
	if(json.success) yield put(RecordingActions.poseEstimationFinish(json.recording))
	else yield put(RecordingActions.recordingErrorStart(json.message))
	// else yield put(CalibrationAction.calibrationFail("Calibration unsuccessful"))
}

const deleteRecordingStart = function* (action) {
	const task = () => new Promise((resolve)=>{
		fetch("/api/recordings/delete/"+ action.payload._id, {
			method: "DELETE",
			headers: getHeaders(true)
		}).then((response)=>response.json()).then((json)=>{
			resolve(json)
		})
	})
	const json = yield call(task);
	if(json.success) yield put(RecordingActions.deleteRecordingFinish(json.recording._id))
	else yield put(RecordingActions.recordingErrorStart(json.message))
}

const recordConversionStart = function* (action) {
	const task = () => new Promise((resolve)=>{
		fetch("/api/fix/mp4", {
			method: "POST",
			body: JSON.stringify({"calibration_id": action.payload.calibration_id, "recording_id": action.payload.recording_id, "idx": action.payload.idx}),
			headers: getHeaders(true)
		}).then((response)=> response.json()).then((json)=>{
			resolve(json)
		})
	})
	const json = yield call(task);
	if(json.idx < 4 ) yield put(RecordingActions.recordConversionStart(action.payload.calibration_id, action.payload.recording_id, json.idx+=1))
	else yield put(RecordingActions.recordConversionFinish())
}

export const RecordingSaga = function* () {
    yield takeEvery(RecordingTypes.RECORDING_START, recordingStart);
	yield takeEvery(RecordingTypes.POSE_ESTIMATION_START, poseEstimationStart);
	yield takeEvery(RecordingTypes.GET_RECORDINGS_START, getRecordingStart);
	yield takeEvery(RecordingTypes.GET_RECORDING_BASE_ON_CALIBRATION_START, getRecordingFromCalibrationStart)
	yield takeEvery(RecordingTypes.DELETE_RECORDING_START, deleteRecordingStart)
	yield takeEvery(RecordingTypes.RECORDING_CONVERSION_START, recordConversionStart)
};
