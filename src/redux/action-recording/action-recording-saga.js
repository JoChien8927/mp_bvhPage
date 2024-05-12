import { call, put, takeEvery } from "redux-saga/effects";
import { getHeaders } from "../utils";
import { ActionRecordingActions } from "./action-recording-action";
import { ActionRecordingTypes } from "./action-recording-types";
import { AlertAction } from "../alert/alert-action";

const NewRecordingStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch(`/api/training_analysis/${action.payload.analysisId}/recordings`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(action.payload),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });

  const json = yield call(task);
  if (json.success) {
    ActionRecordingActions.NewRecordingFinish(
      json.recording,
      action.payload.cameraPosition,
      action.payload.cameraRotation,
      action.callback,
    );
  } else {
    AlertAction.alertStart("Error", json.message);
  }
};

const StoreActionStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_analysis/${action.payload.analysisId}/recordings/${action.payload.recordingId}/actions`,
        {
          method: "POST",
          headers: getHeaders(true),
          body: JSON.stringify(action.payload),
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });

  const json = yield call(task);
  if (json.success) {
    ActionRecordingActions.StoreActionFinish();
  } else {
    AlertAction.alertStart("Error", json.message);
  }
};

const StoreThumbnailStart = function* (action) {
  // Uploads the image related with the recording
  const formData = new FormData();
  formData.append("file", action.payload.file, "thumbnail.jpg");

  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_analysis/${action.payload.analysisId}/recordings/${action.payload.recordingId}/actions/thumbnails/${action.payload.frame}`,
        {
          method: "POST",
          headers: getHeaders(false),
          body: formData,
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });

  const json = yield call(task);
  if (json.success) {
    ActionRecordingActions.StoreThumbnailFinish(json.thumbnail);
  } else {
    AlertAction.alertStart("Error", json.message);
  }
};

const StoreVoiceNoteStart = function* (action) {
  // Uploads the audio related with the voicenote
  const formData = new FormData();
  formData.append("file", action.payload.file, "voicenote.jpg");

  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_analysis/${action.payload.analysisId}/recordings/${action.payload.recordingId}/actions/voice_notes/${action.payload.frame}`,
        {
          method: "POST",
          headers: getHeaders(false),
          body: formData,
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });

  const json = yield call(task);
  if (json.success) {
    ActionRecordingActions.StoreVoiceNoteFinish(json.voiceNote);
  } else {
    AlertAction.alertStart("Error", json.message);
  }
};

const StoreCommentStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_analysis/${action.payload.analysisId}/recordings/${action.payload.recordingId}/actions/comments`,
        {
          method: "POST",
          headers: getHeaders(true),
          body: JSON.stringify(action.payload),
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });

  const json = yield call(task);
  if (json.success) {
    ActionRecordingActions.StoreCommentFinish(json.comment);
  } else {
    AlertAction.alertStart("Error", json.message);
  }
};

const ObtainActionRecordingsStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_analysis/${action.payload.analysisId}/recordings/${action.payload.recordingId}/actions?start=${action.payload.startFrame}&end=${action.payload.endFrame}`,
        {
          method: "GET",
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
    ActionRecordingActions.ObtainActionRecordingsFinish(
      json.recordings,
      json.end,
      json.total,
    );
  } else {
    AlertAction.alertStart("Error", json.message);
  }
};

export const ActionRecordingSaga = function* () {
  yield takeEvery(ActionRecordingTypes.NEW_RECORDING_START, NewRecordingStart);
  yield takeEvery(ActionRecordingTypes.STORE_ACTION_START, StoreActionStart);
  yield takeEvery(
    ActionRecordingTypes.STORE_THUMBNAIL_START,
    StoreThumbnailStart,
  );
  yield takeEvery(
    ActionRecordingTypes.STORE_VOICE_NOTE_START,
    StoreVoiceNoteStart,
  );
  yield takeEvery(ActionRecordingTypes.STORE_COMMENT_START, StoreCommentStart);
  yield takeEvery(
    ActionRecordingTypes.OBTAIN_ACTIONS_START,
    ObtainActionRecordingsStart,
  );
};
