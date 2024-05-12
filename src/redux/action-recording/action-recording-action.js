import { Actions } from "./action";
import { ActionRecordingTypes } from "./action-recording-types";
import { Store } from "../store";
import { BehaviorSubject } from "rxjs";
import { call } from "redux-saga/effects";

export const currentActionRecording$ = new BehaviorSubject({});

const Init = () => ({
  type: ActionRecordingTypes.INIT,
  payload: {},
});

const ShowHideOptions = () => ({
  type: ActionRecordingTypes.SHOW_HIDE_OPTIONS,
  payload: {},
});

const NewRecordingStart = (
  analysisId,
  cameraPosition,
  cameraRotation,
  callback,
) => {
  Store.dispatch({
    type: ActionRecordingTypes.NEW_RECORDING_START,
    payload: {
      analysisId: analysisId,
      cameraPosition: cameraPosition,
      cameraRotation: cameraRotation,
    },
    callback: callback,
  });
};

const NewRecordingFinish = (
  recording,
  cameraPosition,
  cameraRotation,
  callback,
) => {
  Store.dispatch({
    type: ActionRecordingTypes.NEW_RECORDING_FINISH,
    payload: {
      recording: recording,
      cameraPosition: cameraPosition,
      cameraRotation: cameraRotation,
    },
  });

  callback();
};

const PauseRecording = () => {
  Store.dispatch({ type: ActionRecordingTypes.PAUSE_RECORDING });
};

const GetCurrentFrame = () => {
  return (
    Store.getState().ActionRecordingReducer.previousRecordingFrames +
    Math.floor(
      (Date.now() -
        Store.getState().ActionRecordingReducer.currentRecordingStartedAt) /
        30,
    )
  );
};

const createStoreActionDispatcher = (
  actionType,
  payloadMapper = (p) => p,
  optionsMapper = (o) => o,
) => {
  return (...args) => {
    if (Store.getState().ActionRecordingReducer.recordingState != 1) return;
    const payload = payloadMapper(...args);
    const options = optionsMapper(...args);
    Store.dispatch({
      type: ActionRecordingTypes.STORE_ACTION_START,
      payload: {
        analysisId: Store.getState().ActionRecordingReducer.analysisId,
        recordingId: Store.getState().ActionRecordingReducer.recordingId,
        action: actionType,
        frame: GetCurrentFrame(),
        options: options ? options : undefined,
        ...payload,
      },
    });
  };
};

const StoreCameraPosition = (cameraPosition, cameraRotation) => {
  if (Store.getState().ActionRecordingReducer.recordingState != 1) return;

  var currentPos = Store.getState().ActionRecordingReducer.cameraPosition;
  if (
    currentPos.x === cameraPosition.x &&
    currentPos.y === cameraPosition.y &&
    currentPos.z === cameraPosition.z
  ) {
    return;
  }

  createStoreActionDispatcher(
    Actions.threeJS.camera.position_changed,
    (cameraPosition, cameraRotation) => ({
      options: {
        cameraPosition: cameraPosition,
        cameraRotation: cameraRotation,
      },
    }),
  )(cameraPosition, cameraRotation);

  Store.dispatch({
    type: ActionRecordingTypes.STORE_CAMERA_POSITION,
    payload: { cameraPosition: cameraPosition, cameraRotation: cameraRotation },
  });
};

const StoreThumbnailStart = (file) => {
  if (Store.getState().ActionRecordingReducer.recordingState != 1) return;

  Store.dispatch({
    type: ActionRecordingTypes.STORE_THUMBNAIL_START,
    payload: {
      analysisId: Store.getState().ActionRecordingReducer.analysisId,
      recordingId: Store.getState().ActionRecordingReducer.recordingId,
      file: file,
      frame: GetCurrentFrame(),
    },
  });
};

const StoreThumbnailFinish = (thumbnail) => {
  Store.dispatch({
    type: ActionRecordingTypes.STORE_THUMBNAIL_FINISH,
    payload: {
      thumbnail: thumbnail,
    },
  });
};

const StoreCommentStart = (comment) => {
  Store.dispatch({
    type: ActionRecordingTypes.STORE_COMMENT_START,
    payload: {
      options: { comment: comment },
      analysisId: Store.getState().ActionRecordingReducer.analysisId,
      recordingId: Store.getState().ActionRecordingReducer.recordingId,
      action: Actions.comments.new,
      frame: GetCurrentFrame(),
    },
  });
};

const StoreCommentFinish = (comment) => {
  Store.dispatch({
    type: ActionRecordingTypes.STORE_COMMENT_FINISH,
    payload: {
      comment: comment,
    },
  });
};

const StoreVoiceNoteStart = (file) => {
  if (Store.getState().ActionRecordingReducer.recordingState != 1) return;

  Store.dispatch({
    type: ActionRecordingTypes.STORE_VOICE_NOTE_START,
    payload: {
      analysisId: Store.getState().ActionRecordingReducer.analysisId,
      recordingId: Store.getState().ActionRecordingReducer.recordingId,
      file: file,
      frame: GetCurrentFrame(),
    },
  });
};

const StoreVoiceNoteFinish = (voiceNote) => {
  Store.dispatch({
    type: ActionRecordingTypes.STORE_VOICE_NOTE_FINISH,
    payload: {
      voiceNote: voiceNote,
    },
  });
};

const StoreMenuOpenCloseAction = createStoreActionDispatcher(
  Actions.menu.general.open_collapse,
  (optionSelected) => ({ options: { optionSelected: optionSelected } }),
);

const StoreMenuModeChanged = createStoreActionDispatcher(
  Actions.menu.mode.changed,
  (mode) => ({ options: { mode: mode } }),
);

// Drawing

const StoreMenuDrawActivateInactivate = createStoreActionDispatcher(
  Actions.menu.draw.activate_inactivate,
  (show) => ({ options: { show: show } }),
);

const StoreDrawPencilSelected = createStoreActionDispatcher(
  Actions.menu.draw.pencil_selected,
);

const StoreDrawEraserSelected = createStoreActionDispatcher(
  Actions.menu.draw.eraser_selected,
);

const StoreDrawColorSelected = createStoreActionDispatcher(
  Actions.menu.draw.color,
  (color) => ({ options: { color: color } }),
);

const StoreDrawClear = createStoreActionDispatcher(Actions.menu.draw.clear);

const StoreDrawUndo = createStoreActionDispatcher(Actions.menu.draw.undo);

const StoreDrawRedo = createStoreActionDispatcher(Actions.menu.draw.redo);

const StoreDrawBrushSizeSelected = createStoreActionDispatcher(
  Actions.menu.draw.brush_size,
  (brushSize) => ({ options: { brushSize: brushSize } }),
);

const StoreDrawStroke = createStoreActionDispatcher(
  Actions.threeJS.drawing.stroke,
  (points, drawingLocation) => ({
    options: { points: points, drawingLocation: drawingLocation },
  }),
);

const StoreEraseStroke = createStoreActionDispatcher(
  Actions.threeJS.drawing.erase,
  (mouse, drawingLocation) => ({
    options: { mouse: mouse, drawingLocation: drawingLocation },
  }),
);

// Angles

const StoreMenuAnglesActivateInactivate = createStoreActionDispatcher(
  Actions.menu.angles.activate_inactivate,
  (show) => ({ options: { show: show } }),
);

const StoreMenuAnglesShowHideAngle = createStoreActionDispatcher(
  Actions.menu.angles.show_hide_angle,
  (angle, show) => ({ options: { angle: angle, show: show } }),
);

// Trajectory

const StoreMenuTrajectoryActivateInactivate = createStoreActionDispatcher(
  Actions.menu.trajectory.activate_inactivate,
  (show) => ({ options: { show: show } }),
);

const StoreMenuTrajectoryShowHideLimb = createStoreActionDispatcher(
  Actions.menu.trajectory.show_hide_limb,
  (limb, show) => ({ options: { limb: limb, show: show } }),
);

const StoreMenuTrajectoryDensity = createStoreActionDispatcher(
  Actions.menu.trajectory.density,
  (density) => ({ options: { density: density } }),
);

const StoreMenuTrajectoryLength = createStoreActionDispatcher(
  Actions.menu.trajectory.length,
  (length) => ({ options: { length: length } }),
);

// Playback

const StorePlayerPlayPause = createStoreActionDispatcher(
  Actions.player.play_pause,
  (isPlay) => ({ options: { isPlay: isPlay } }),
);

const StorePlayerPlayInterval = createStoreActionDispatcher(
  Actions.player.play_interval,
  (increase, playActionNeeded) => ({
    options: { increase: increase, playActionNeeded: playActionNeeded },
  }),
);

const StorePlayerUpdateFrame = createStoreActionDispatcher(
  Actions.player.update_frame,
  (frame) => ({ options: { frame: frame } }),
);

const StorePlayerLoop = createStoreActionDispatcher(Actions.player.loop);

const StorePlayerSpeed = createStoreActionDispatcher(
  Actions.player.speed,
  (speed) => ({ options: { speed: speed } }),
);

const StoreActionFinish = () => {
  if (Store.getState().ActionRecordingReducer.recordingState != 1) return;

  Store.dispatch({
    type: ActionRecordingTypes.STORE_ACTION_FINISH,
    payload: {},
  });
};

const ObtainActionRecordingsStart = (startFrame, endFrame) => {
  Store.dispatch({
    type: ActionRecordingTypes.OBTAIN_ACTIONS_START,
    payload: {
      analysisId: "64350fe7430c0d250f6c0504",
      recordingId: "643522b0019b1a57f949b031",
      startFrame: startFrame,
      endFrame: endFrame,
    },
  });
};

const ObtainActionRecordingsFinish = (
  recordings,
  recordingsFramesEnd,
  totalRecordings,
) => {
  Store.dispatch({
    type: ActionRecordingTypes.OBTAIN_ACTIONS_FINISH,
    payload: {
      recordings: recordings,
      recordingsFramesEnd: recordingsFramesEnd,
      totalRecordings: totalRecordings,
    },
  });
};

const PlayActionFrame = () => {
  const actions = Store.getState().ActionRecordingReducer.recordings.filter(
    (x) => x.frame == Store.getState().ActionRecordingReducer.currentFrame,
  );

  actions.forEach((action) => {
    currentActionRecording$.next(action);
  });

  Store.dispatch({ type: ActionRecordingTypes.PLAY_ACTION_FRAME });
};

export const ActionRecordingActions = {
  Init,
  ShowHideOptions,
  NewRecordingStart,
  NewRecordingFinish,
  PauseRecording,
  StoreCameraPosition,
  StoreThumbnailStart,
  StoreThumbnailFinish,
  StoreVoiceNoteStart,
  StoreVoiceNoteFinish,
  StoreCommentStart,
  StoreCommentFinish,
  StoreMenuOpenCloseAction,
  StoreMenuModeChanged,
  StoreMenuDrawActivateInactivate,
  StoreDrawPencilSelected,
  StoreDrawEraserSelected,
  StoreDrawColorSelected,
  StoreDrawClear,
  StoreDrawUndo,
  StoreDrawRedo,
  StoreDrawStroke,
  StoreEraseStroke,
  StoreDrawBrushSizeSelected,
  StoreMenuAnglesActivateInactivate,
  StoreMenuAnglesShowHideAngle,
  StoreMenuTrajectoryActivateInactivate,
  StoreMenuTrajectoryShowHideLimb,
  StoreMenuTrajectoryDensity,
  StoreMenuTrajectoryLength,
  StoreActionFinish,
  StorePlayerPlayPause,
  StorePlayerPlayInterval,
  StorePlayerUpdateFrame,
  StorePlayerLoop,
  StorePlayerSpeed,
  ObtainActionRecordingsStart,
  ObtainActionRecordingsFinish,
  PlayActionFrame,
};
