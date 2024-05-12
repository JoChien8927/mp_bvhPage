import { call, put, takeEvery } from "redux-saga/effects";
import { AlertAction } from "../alert/alert-action";
import { TrainingPoseAction } from "./training-poses-action";
import { TrainingPosesTypes } from "./training-poses-types";
import { getHeaders } from "../utils";
import { generateUUID } from "three/src/math/MathUtils";

const TrainingPoseGetAllStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      const filter = encodeURIComponent(action.payload.filter);
      const sortBy = encodeURIComponent(action.payload.sortBy);
      fetch(
        `/api/training_poses?userId=${action.payload.userId}&filter=${filter}&sortBy=${sortBy}`,
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
    yield put(TrainingPoseAction.TrainingPoseGetAllFinish(json.trainingPoses));
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const TrainingPoseCreateStart = function* (action) {
  // Create a new pose
  const create_pose_task = () =>
    new Promise((resolve) => {
      fetch(`/api/training_poses?userId=${action.payload.userId}`, {
        method: "POST",
        body: JSON.stringify({
          description: action.payload.description,
          sportCategory: action.payload.sportCategory,
          skillType: action.payload.skillType,
        }),
        headers: getHeaders(true),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });

  const pose_created_response = yield call(create_pose_task);

  if (!pose_created_response.success) {
    yield put(AlertAction.alertStart("Error", video_uploaded_response.message));
    return;
  }

  yield put(
    TrainingPoseAction.TrainingPoseCreateFinish(
      pose_created_response.trainingPose,
    ),
  );

  // Uploads the video related with the training pose
  const formData = new FormData();
  formData.append(
    "file",
    action.payload.file,
    "pose_" +
      pose_created_response.trainingPose._id +
      "." +
      action.payload.fileType,
  );

  const upload_video_task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_poses/${pose_created_response.trainingPose._id}/videos/${action.payload.fileType}?userId=${action.payload.userId}`,
        {
          method: "POST",
          headers: getHeaders(false),
          body: formData,
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        })
        .catch((e) => {
          console.log(e);
        });
    });
  const video_uploaded_response = yield call(upload_video_task);

  if (!video_uploaded_response.success) {
    yield put(AlertAction.alertStart("Error", video_uploaded_response.message));
    return;
  }

  yield put(
    TrainingPoseAction.TrainingPoseUploadFinish(
      video_uploaded_response.trainingPose,
    ),
  );

  const process_video_task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_poses/${pose_created_response.trainingPose._id}/videos/${action.payload.fileType}/analyze?userId=${action.payload.userId}`,
        {
          method: "POST",
          headers: getHeaders(false),
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        })
        .catch((e) => {
          console.log(e);
        });
    });
  const video_processed_response = yield call(process_video_task);

  if (!video_processed_response.success) {
    yield put(
      AlertAction.alertStart("Error", video_processed_response.message),
    );
    return;
  }

  yield put(
    TrainingPoseAction.TrainingPoseProcessFinish(
      video_processed_response.trainingPose,
    ),
  );
};

const TrainingPoseGetStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch(`/api/training_poses/${action.payload.trainingPoseId}`, {
        method: "GET",
        headers: getHeaders(true),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const trainin_pose = yield call(task);

  const reference_task = () =>
    new Promise((resolve) => {
      fetch(`/api/training_poses/${action.payload.trainingPoseReferenceId}`, {
        method: "GET",
        headers: getHeaders(true),
      })
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  const reference_pose = yield call(reference_task);

  if (trainin_pose.success && reference_pose.success) {
    yield put(
      TrainingPoseAction.TrainingPoseGetFinish(
        trainin_pose.trainingPose,
        reference_pose.trainingPose,
      ),
    );
  } else {
    yield put(AlertAction.alertStart("Error", trainin_pose.message));
  }
};

const TrainingPoseDeleteStart = function* (action) {
  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_poses/${action.payload.trainingPoseId}?userId=${action.payload.userId}`,
        {
          method: "DELETE",
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
    yield put(
      TrainingPoseAction.TrainingPoseDeleteFinish(
        action.payload.userId,
        action.payload.trainingPoseId,
      ),
    );
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const TrainingPoseAddCommentStart = function* (action) {
  yield put(TrainingPoseAction.TrainingRecordingStartFlag(true));
  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_poses/${action.payload.trainingPoseId}/recordings/comments?userId=${action.payload.userId}`,
        {
          method: "POST",
          body: JSON.stringify({
            comment: action.payload.comment,
          }),
          headers: getHeaders(true),
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        })
        .catch((e) => {
          console.log(e);
        });
    });

  const json = yield call(task);

  if (json.success) {
    yield put(
      TrainingPoseAction.TrainingPoseAddCommentFinish(json.trainingPose),
    );
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const TrainingPoseEditCommentStart = function* (action) {
  yield put(TrainingPoseAction.TrainingRecordingStartFlag(true));
  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_poses/${action.payload.trainingPoseId}/recordings/comments/${action.payload.comment.id}`,
        {
          method: "POST",
          body: JSON.stringify({
            comment: action.payload.comment,
          }),
          headers: getHeaders(true),
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        })
        .catch((e) => {
          console.log(e);
        });
    });

  const json = yield call(task);

  if (json.success) {
    yield put(
      TrainingPoseAction.TrainingPoseEditCommentFinish(json.trainingPose),
    );
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const TrainingPoseDeleteInProgressRecordingStart = function* (action) {
  yield put(TrainingPoseAction.TrainingRecordingStartFlag(true));
  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_poses/${action.payload.trainingPoseId}/recordings/delete-in-progress`,
        {
          method: "POST",
          headers: getHeaders(true),
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        })
        .catch((e) => {
          console.log(e);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(
      TrainingPoseAction.TrainingPoseDeleteInProgressRecordingFinish(
        json.trainingPose,
      ),
    );
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const TrainingPoseProcessRecordingStart = function* (action) {
  const guid = generateUUID();
  const formData = new FormData();
  formData.append(
    "file_" + guid,
    action.payload.file,
    "recording_" + guid + ".mp4",
  );

  yield put(TrainingPoseAction.TrainingRecordingStartFlag(true));
  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_analysis/${action.payload.analysisId}/recordings/process`,
        {
          method: "POST",
          headers: getHeaders(false),
          body: formData,
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        })
        .catch((e) => {
          console.log(e);
        });
    });
  const json = yield call(task);
  if (json.success) {
    yield put(
      TrainingPoseAction.TrainingPoseProcessRecordingFinish(
        json.trainingAnalysis,
      ),
    );
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const TrainingPoseSaveRecordingStart = function* (action) {
  yield put(TrainingPoseAction.TrainingRecordingStartFlag(true));
  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_poses/${action.payload.trainingPoseId}/recordings/save`,
        {
          method: "POST",
          headers: getHeaders(true),
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        })
        .catch((e) => {
          console.log(e);
        });
    });

  const json = yield call(task);

  if (json.success) {
    yield put(
      TrainingPoseAction.TrainingPoseSaveRecordingFinish(json.trainingPose),
    );
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

const TrainingPoseUndoRecordingStart = function* (action) {
  yield put(TrainingPoseAction.TrainingRecordingStartFlag(true));
  const task = () =>
    new Promise((resolve) => {
      fetch(
        `/api/training_poses/${action.payload.trainingPoseId}/recordings/undo`,
        {
          method: "POST",
          headers: getHeaders(true),
        },
      )
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        })
        .catch((e) => {
          console.log(e);
        });
    });

  const json = yield call(task);

  if (json.success) {
    yield put(
      TrainingPoseAction.TrainingPoseUndoRecordingFinish(json.trainingPose),
    );
  } else {
    yield put(AlertAction.alertStart("Error", json.message));
  }
};

export const TrainingPoseSaga = function* () {
  yield takeEvery(
    TrainingPosesTypes.TRAINING_POSES_GET_ALL_START,
    TrainingPoseGetAllStart,
  );
  yield takeEvery(
    TrainingPosesTypes.TRAINING_POSES_CREATE_START,
    TrainingPoseCreateStart,
  );
  yield takeEvery(
    TrainingPosesTypes.TRAINING_POSES_GET_START,
    TrainingPoseGetStart,
  );

  yield takeEvery(
    TrainingPosesTypes.TRAINING_POSES_DELETE_START,
    TrainingPoseDeleteStart,
  );

  yield takeEvery(
    TrainingPosesTypes.TRAINING_POSES_UPLOAD_POSE_RECORDING_START,
    TrainingPoseSaveRecordingStart,
  );
  yield takeEvery(
    TrainingPosesTypes.TRAINING_POSES_UNDO_POSE_RECORDING_START,
    TrainingPoseUndoRecordingStart,
  );
  yield takeEvery(
    TrainingPosesTypes.TRAINING_POSES_PROCESS_POSE_RECORDING_START,
    TrainingPoseProcessRecordingStart,
  );
  yield takeEvery(
    TrainingPosesTypes.TRAINING_POSES_DELETE_IN_PROGRESS_POSE_RECORDING_START,
    TrainingPoseDeleteInProgressRecordingStart,
  );
  yield takeEvery(
    TrainingPosesTypes.TRAINING_POSES_ADD_COMMENT_START,
    TrainingPoseAddCommentStart,
  );
  yield takeEvery(
    TrainingPosesTypes.TRAINING_POSES_EDIT_COMMENT_START,
    TrainingPoseEditCommentStart,
  );
};
