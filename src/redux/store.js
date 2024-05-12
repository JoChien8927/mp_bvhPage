import { applyMiddleware, combineReducers, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { all, call, fork } from "redux-saga/effects";
import { LoggerReducer } from "./logger/logger-reducer";
import { LoggerSaga } from "./logger/logger-saga";
import { LoginReducer } from "./login/login-reducer";
import { AlertReducer } from "./alert/alert-reducer";
import { ControllerReducer } from "./controller/controller-reducer";
import { LoginSaga } from "./login/login-saga";
import { ControllerSaga } from "./controller/controller-saga";
import { CalibrationSaga } from "./calibration/calibration-saga"
import { TrainingPoseReducer } from "./training-poses/training-poses-reducer";
import { PoseAnalysisSelectionReducer } from "./pose-analysis-selection/pose-analysis-selection-reducer";
import { PoseAnalysisReducer } from "./pose-analysis/pose-analysis-reducer";
import { TrainingAnalysisReducer } from "./training-analysis/training-analysis-reducer";
import { WorkspaceMenuReducer } from "./workspace-menu/workspace-menu-reducer";
import { RecordingReducer } from "./recordings/recording-reducer";
import { AnglesReducer } from "./angles/angles-reducer";
import { StyleReducer } from "./style/style-reducer";
import { StudentReducer } from "./student/student-reducer";
import { StudentSaga } from "./student/student-saga";
import { FriendsReducer } from "./friends/friends-reducer";
import { FriendsSaga } from "./friends/friends-saga";
import { TrainingPoseSaga } from "./training-poses/training-poses-saga";
import { PoseAnalysisSelectionSaga } from "./pose-analysis-selection/pose-analysis-selection-saga";
import { PoseAnalysisSaga } from "./pose-analysis/pose-analysis-saga";
import { TrainingAnalysisSaga } from "./training-analysis/training-analysis-saga";
import { ActionRecordingSaga } from "./action-recording/action-recording-saga";
import { ActionRecordingReducer } from "./action-recording/action-recording-reducer";
import { CalibrationReducer } from "./calibration/calibration-reducer";
import { RecordingSaga } from "./recordings/recording-saga";

const saga = createSagaMiddleware();

export const Store = createStore(
  combineReducers({
    LoggerReducer,
    LoginReducer,
    AlertReducer,
    TrainingPoseReducer,
    WorkspaceMenuReducer,
    PoseAnalysisSelectionReducer,
    PoseAnalysisReducer,
    TrainingAnalysisReducer,
    RecordingReducer,
    AnglesReducer,
    FriendsReducer,
    ControllerReducer,
    StudentReducer,
    StyleReducer,
    ActionRecordingReducer,
    CalibrationReducer
  }),
  applyMiddleware(saga),
);

saga.run(function* () {
  yield all([
    call(LoggerSaga),
    ...[
      ControllerSaga,
      StudentSaga,
      FriendsSaga,
      TrainingPoseSaga,
      PoseAnalysisSelectionSaga,
      PoseAnalysisSaga,
      TrainingAnalysisSaga,
      ActionRecordingSaga,
      CalibrationSaga,
      RecordingSaga,
      LoginSaga,
    ].map(fork),
  ]);
});
