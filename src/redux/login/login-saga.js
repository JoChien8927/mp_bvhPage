import { call, put, takeEvery } from "redux-saga/effects";
import { AlertAction } from "../alert/alert-action";
import { LoginAction } from "./login-action";
import { LoginTypes } from "./login-types";
import { getHeaders } from "../utils";

const LoginCreateStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch("/api/users", {
        method: "POST",
        body: action.payload.accountInfo,
        headers: getHeaders(true),
      })
        .then((response) => response.json())
        .then((accountCreation) => {
          resolve(accountCreation);
        });
    });
  const accountCreation = yield call(task);
  if (accountCreation.success) {
    yield put(
      LoginAction.LoginCreateFinish(
        accountCreation.success,
        accountCreation.user,
        accountCreation.accessToken,
      ),
    );
  } else {
    yield put(AlertAction.alertStart("Error", accountCreation.message));
    return;
  }

  // Uploads the video related with the training pose
  const formData = new FormData();
  formData.append(
    "file",
    action.payload.photoFile,
    action.payload.photoFile.name,
  );

  const upload_photo = () =>
    new Promise((resolve) => {
      fetch("/api/users/" + accountCreation.user._id + "/photo", {
        method: "POST",
        body: formData,
        headers: getHeaders(false),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        })
        .catch((e) => {
          console.log(e);
        });
    });
  const upload_photo_response = yield call(upload_photo);

  if (upload_photo_response.success) {
    yield put(
      LoginAction.LoginCreateFinish(
        upload_photo_response.success,
        upload_photo_response.user,
        accountCreation.accessToken,
      ),
    );
  } else {
    yield put(AlertAction.alertStart("Error", upload_photo_response.message));
    return;
  }
};

const ValidateTokenStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch("/api/users/validate-token", {
        method: "POST",
        body: action.payload.loginInfo,
        headers: getHeaders(true),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(
      LoginAction.LoginFinish(json.user, localStorage.getItem("accessToken")),
    );
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const LoginStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch("/api/users/login", {
        method: "POST",
        body: action.payload.loginInfo,
        headers: getHeaders(true),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(LoginAction.LoginFinish(json.user, json.accessToken));
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

export const LoginSaga = function* () {
  yield takeEvery(LoginTypes.LOGIN_CREATE_START, LoginCreateStart);
  yield takeEvery(LoginTypes.VALIDATE_TOKEN_START, ValidateTokenStart);
  yield takeEvery(LoginTypes.LOGIN_START, LoginStart);
};
