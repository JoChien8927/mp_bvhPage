import { createReducer } from "../utils";
import { StyleTypes } from "./style-types";

const initialState = {
  generalPadding: 20,
  headerHeight: 55,
  poseHeaderHeight: 45,
  playbackHeight: 64,
  recordingHeight: 64,
  windowsVH: 0,
  canvasWrapperVH: 0,
  canvasWrapperMaxVH: 0,
  canvasVH: 0,
  canvasMaxVH: 0,
  canvasWithoutRecordingVH: 0,
  canvasWithoutRecordingMaxVH: 0,
  posesAvailable: 0,
};

const resize = (state, payload) => {
  return {
    ...state,
    windowsVH: payload.clientHeight,
    canvasWrapperVH: payload.clientHeight - state.headerHeight,
    canvasWrapperMaxVH: "calc(100vh - " + state.headerHeight + "px)",

    canvasWithRecordingVH:
      payload.clientHeight -
      state.headerHeight -
      state.playbackHeight -
      state.recordingHeight,
    canvasWithRecordingMaxVH:
      "calc(100vh - " +
      state.headerHeight -
      state.playbackHeight -
      state.recordingHeight +
      "px)",

    canvasWithoutRecordingVH:
      payload.clientHeight - state.headerHeight - state.playbackHeight,
    canvasWithoutRecordingMaxVH:
      "calc(100vh - " + state.headerHeight - state.playbackHeight + "px)",

    posesAvailableVH:
      payload.clientHeight - (state.headerHeight + 2 * state.generalPadding),
    posesAvailableMaxVH:
      "calc(100vh - " + (state.headerHeight + 2 * state.generalPadding) + "px)",
    posesAvailableBackgroundVH:
      payload.clientHeight -
      (state.headerHeight + state.poseHeaderHeight + 2 * state.generalPadding),
    posesAvailableBackgroundMaxVH:
      "calc(100vh - " +
      (state.headerHeight + state.poseHeaderHeight + 2 * state.generalPadding) +
      "px)",

    posesSelectionPreviewBodyVH:
      payload.clientHeight -
      (state.headerHeight +
        state.poseHeaderHeight +
        65 +
        2 * state.generalPadding),
    posesSelectionPreviewBodyMaxVH:
      "calc(100vh - " +
      (state.headerHeight +
        state.poseHeaderHeight +
        65 +
        2 * state.generalPadding) +
      "px)",

    posesSelectionPreviewBodyImageVH:
      payload.clientHeight -
      (state.headerHeight +
        state.poseHeaderHeight +
        65 +
        86 +
        76 +
        2 * state.generalPadding),
    posesSelectionPreviewBodyMaxImageVH:
      "calc(100vh - " +
      (state.headerHeight +
        state.poseHeaderHeight +
        65 +
        2 * state.generalPadding) +
      "px)",

    poseVisualizationVH:
      payload.clientHeight - (state.headerHeight + state.generalPadding) + 80,
    poseVisualizationMaxVH:
      "calc(100vh - " +
      (state.headerHeight + state.generalPadding + 80) +
      "px)",

    poseVisualizationImageVH:
      payload.clientHeight -
      (state.headerHeight + state.generalPadding) +
      80 +
      40 +
      20,
    poseVisualizationImageMaxVH:
      "calc(100vh - " +
      (state.headerHeight + state.generalPadding + 80 + 40 + 20) +
      "px)",
  };
};

export const StyleReducer = createReducer(initialState, {
  [StyleTypes.RESIZE]: resize,
});
