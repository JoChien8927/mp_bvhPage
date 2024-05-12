import { call, put, takeEvery } from "redux-saga/effects";
import { AlertAction } from "../alert/alert-action";
import { FriendsAction } from "./friends-action";
import { FriendsTypes } from "./friends-types";
import { getHeaders } from "../utils";

const GetAddedStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch("/api/users/" + action.payload.userId + "/friends/added", {
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
    yield put(FriendsAction.GetAddedFinish(action.payload.userId, json.added));
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
    return;
  }
};

const GetNotAddedStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch("/api/users/" + action.payload.userId + "/friends/not-added", {
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
    yield put(FriendsAction.GetNotAddedFinish(json.notAdded));
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
    return;
  }
};

const SendRequestStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch(
        "/api/users/" +
          action.payload.userId +
          "/friends/" +
          action.payload.friendUserId,
        {
          method: "POST",
          headers: getHeaders(true),
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(FriendsAction.GetNotAddedFinish(json.notAdded));
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
    return;
  }
};

const AcceptRequestStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch(
        "/api/users/" +
          action.payload.userId +
          "/friends/" +
          action.payload.friendUserId +
          "/accept",
        {
          method: "POST",
          headers: getHeaders(true),
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(FriendsAction.GetAddedStart(action.payload.userId));
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
    return;
  }
};

export const FriendsSaga = function* () {
  yield takeEvery(FriendsTypes.ADDED_START, GetAddedStart);
  yield takeEvery(FriendsTypes.NOT_ADDED_START, GetNotAddedStart);
  yield takeEvery(FriendsTypes.SEND_REQUEST_START, SendRequestStart);
  yield takeEvery(FriendsTypes.ACCEPT_REQUEST_START, AcceptRequestStart);
};
