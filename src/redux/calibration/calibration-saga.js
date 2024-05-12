import { call, put, takeEvery } from "redux-saga/effects";
import { CalibrationAction } from "./calibration-action";
import { CalibrationTypes } from "./calibration-types";
import { getHeaders } from "../utils";

const calibrationImageSendStart = function* (action) {
	const task = () =>
	  new Promise((resolve) => {
		fetch("/api/upload/calibration_images", {
		  method: "POST",
		  body: JSON.stringify({ cam: action.payload.cam, image1: action.payload.base64_1, image2: action.payload.base64_2, image3: action.payload.base64_3, image4: action.payload.base64_4 }),
		  headers: getHeaders(true),
		})
		  .then((response) => response.json())
		  .then((json) => {
			resolve(json);
		  });
	  });
	const json = yield call(task);
	if(json.success) yield put(CalibrationAction.calibrationImageSendFinish(json.message, json.calibration));
	else CalibrationAction.calibrationFail("Failed to upload image: "+ json.message)
};

const calibrationGetAllStart = function* (action) {
	const task = () =>
	  new Promise((resolve) => {
		fetch("/api/calibration/all", {
		  method: "GET",
		  headers: getHeaders(true),
		})
		  .then((response) => response.json())
		  .then((json) => {
			resolve(json);
		  });
	  });
	const json = yield call(task);
	if(json.success) yield put(CalibrationAction.calibrationGetFinish(json.calibrations));
	// else CalibrationAction.calibrationFail("Failed to upload image: "+ json.message)
};

const calibrationDeleteStart = function* (action) {
	const task = ()=> new Promise((resolve)=>{
		fetch("/api/calibration/delete/"+ action.payload._id, {
			method: "DELETE",
			headers: getHeaders(true),
			})
			.then((response) => response.json())
			.then((json) => {
				resolve(json);
		});
	})
	const json = yield call(task)
	if(json.success) yield put(CalibrationAction.calibrationDeleteFinish(json.calibration._id))
}
const calibrationGetIDStart = function* (action) {
	const task = () =>
	  new Promise((resolve) => {
		fetch("/api/calibration/get/"+ action.payload._id, {
		  method: "GET",
		  headers: getHeaders(true),
		})
		  .then((response) => response.json())
		  .then((json) => {
			resolve(json);
		  });
	  });
	const json = yield call(task);
	if(json.success) yield put(CalibrationAction.calibrationIDFinish(json.calibration.cam));
	else yield put(CalibrationAction.calibrationFail("Failed to upload image: "+ json.message))
};

const calibrationStart = function* (action) {
	const task = () => new Promise((resolve)=>{
		fetch("/api/calibration/start", {
			method: "POST",
			body: JSON.stringify({"calibration_id": action.payload._id}),
			headers: getHeaders(true)
		}).then((response)=>response.json()).then((json)=>{
			resolve(json)
		})
	})
	const json = yield call(task);
	if(json.success) yield put(CalibrationAction.calibrationPythonFinish(json))
	else yield put(CalibrationAction.calibrationFail("Calibration unsuccessful"))
}

export const CalibrationSaga = function* () {
	yield takeEvery(CalibrationTypes.CALIBRATION_SEND_IMAGE_START, calibrationImageSendStart);
	yield takeEvery(CalibrationTypes.CALIBRATION_GET_ALL_START, calibrationGetAllStart);
	yield takeEvery(CalibrationTypes.CALIBRATION_GET_ID_START, calibrationGetIDStart);
	yield takeEvery(CalibrationTypes.CALIBRATION_PYTHON_START, calibrationStart);
	yield takeEvery(CalibrationTypes.CALIBRATION_DELETE_START,calibrationDeleteStart)
};
