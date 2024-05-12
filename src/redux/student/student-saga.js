import { StudentTypes } from "./student-types";
import { StudentAction } from "./student-actions";
import { call, put, takeEvery } from "redux-saga/effects";
import { AlertAction } from "../alert/alert-action";
import { getHeaders } from "../utils";

const FetchAllStudentStart = function* () {
  const task = () =>
    new Promise((resolve) => {
      fetch("/api/students", {
        method: "GET",
        headers: getHeaders(true),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(StudentAction.FetchAllStudentFinish(json.students));
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const FetchMyStudentStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch("/api/mystudents", {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ _id: action.payload._id }),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(StudentAction.FetchMyStudentFinish(json.students));
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const UpdateStudentStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch("/api/teacher-student-update", {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          _id: action.payload._id,
          _ids: action.payload._ids,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(StudentAction.UpdateStudentFinish(json.student_ids));
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

export const StudentSaga = function* () {
  yield takeEvery(StudentTypes.FETCH_ALL_STUDENT_START, FetchAllStudentStart);
  yield takeEvery(StudentTypes.FETCH_MY_STUDENT_START, FetchMyStudentStart);
  yield takeEvery(StudentTypes.UPDATE_STUDENT_START, UpdateStudentStart);
};
