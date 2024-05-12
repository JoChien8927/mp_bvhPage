import { call, put, takeEvery } from "redux-saga/effects";
import { ControllerAction } from "./controller-action";
import { ControllerTypes } from "./controller-types";
import { getHeaders } from "../utils";

const controllerFetchStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch("/api/controller", {
        method: "POST",
        body: JSON.stringify({ userId: action.payload.userId }),
        headers: getHeaders(true),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(ControllerAction.controllerFetchFinish(json.controller[0]));
  }
};

const controllerUpdateStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch("/api/update-controller/" + action.payload.userId, {
        method: "POST",
        body: action.payload.controller,
        headers: getHeaders(true),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(ControllerAction.controllerFetchFinish(json.controller));
  }
};

export const ControllerSaga = function* () {
  yield takeEvery(ControllerTypes.CONTROLLER_FETCH_START, controllerFetchStart);
  yield takeEvery(
    ControllerTypes.CONTROLLER_UPDATE_START,
    controllerUpdateStart,
  );
};
