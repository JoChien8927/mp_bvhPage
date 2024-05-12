import { createReducer } from "../utils";
import { WorkspaceMenuTypes } from "./workspace-menu-types";

const initialState = {
  mode: {
    sceneMode: 1,
    cameraMode: 0,
  },
  subMenuOpen: false,
  subMenuOption: null,
  menuOptions: {
    move: 0,
    redo: 1,
    undo: 2,
    mode: 3,
    draw: 4,
    trajectory: 5,
    angles: 6,
    zoom: 7,
    laser: 8,
    recordings: 9,
  },
  drawOptions: {
    show: false,
    drawPencilActive: true,
    drawEraserActive: false,
    brushRadius: 2,
    brushColor: "#000000",
    lastTimeClear: null,
    lastTimeUndo: null,
    lastTimeRedo: null,
  },
  laserOptions: {
    show: false,
    brushRadius: 15,
    brushColor: "#000000",
  },
  trajectoryOptions: {
    show: false,
    length: 50,
    density: 75,
    head: false,
    spine: false,
    rightShoulder: false,
    rightArm: false,
    rightHand: false,
    leftShoulder: false,
    leftArm: false,
    leftHand: false,
    hips: false,
    rightLeg: false,
    leftLeg: false,
  },
  angleOptions: {
    show: false,
    showGraph: false,
    rightUpperArm: false,
    rightMiddleArm: false,
    rightUpperLeg: false,
    rightMiddleLeg: false,
    leftUpperArm: false,
    leftMiddleArm: false,
    leftUpperLeg: false,
    leftMiddleLeg: false,
  },
};

const WorkspaceLoad = () => {
  return {
    ...initialState,
  };
};

const MenuModeSceneUpdate = (state, payload) => {
  return {
    ...state,
    mode: { ...state.mode, sceneMode: payload.sceneMode },
  };
};

const MenuLaserOptionsUpdate = (state, payload) => {
  return {
    ...state,
    laserOptions: {
      ...state.laserOptions,
      show: payload.laserOptions.show,
      brushRadius: payload.laserOptions.brushRadius,
      brushColor: payload.laserOptions.brushColor,
    },
  };
};

const MenuDrawOptionsUpdate = (state, payload) => {
  return {
    ...state,
    drawOptions: {
      ...state.drawOptions,
      show: payload.drawOptions.show,
      drawPencilActive: payload.drawOptions.drawPencilActive,
      drawEraserActive: payload.drawOptions.drawEraserActive,
      brushRadius: payload.drawOptions.brushRadius,
      brushColor: payload.drawOptions.brushColor,
      lastTimeClear: payload.drawOptions.lastTimeClear,
    },
  };
};

const MenuClearDraw = (state) => {
  return {
    ...state,
    drawOptions: {
      ...state.drawOptions,
      lastTimeClear: Date.now(),
    },
  };
};

const MenuUndoDraw = (state) => {
  return {
    ...state,
    drawOptions: {
      ...state.drawOptions,
      lastTimeUndo: Date.now(),
    },
  };
};

const MenuRedoDraw = (state) => {
  return {
    ...state,
    drawOptions: {
      ...state.drawOptions,
      lastTimeRedo: Date.now(),
    },
  };
};

const MenuTrajectoryOptionsUpdate = (state, payload) => {
  return {
    ...state,
    trajectoryOptions: {
      ...state.trajectoryOptions,
      show: payload.trajectoryOptions.show,
      length: payload.trajectoryOptions.length,
      density: payload.trajectoryOptions.density,
      head: payload.trajectoryOptions.head,
      spine: payload.trajectoryOptions.spine,
      rightShoulder: payload.trajectoryOptions.rightShoulder,
      rightArm: payload.trajectoryOptions.rightArm,
      rightHand: payload.trajectoryOptions.rightHand,
      leftShoulder: payload.trajectoryOptions.leftShoulder,
      leftArm: payload.trajectoryOptions.leftArm,
      leftHand: payload.trajectoryOptions.leftHand,
      hips: payload.trajectoryOptions.hips,
      rightLeg: payload.trajectoryOptions.rightLeg,
      leftLeg: payload.trajectoryOptions.leftLeg,
    },
  };
};

const MenuAngleOptionsUpdate = (state, payload) => {
  return {
    ...state,
    angleOptions: {
      ...state.angleOptions,
      show: payload.angleOptions.show,
      showGraph: payload.angleOptions.showGraph,
      rightUpperArm: payload.angleOptions.rightUpperArm,
      rightMiddleArm: payload.angleOptions.rightMiddleArm,
      rightUpperLeg: payload.angleOptions.rightUpperLeg,
      rightMiddleLeg: payload.angleOptions.rightMiddleLeg,
      leftUpperArm: payload.angleOptions.leftUpperArm,
      leftMiddleArm: payload.angleOptions.leftMiddleArm,
      leftUpperLeg: payload.angleOptions.leftUpperLeg,
      leftMiddleLeg: payload.angleOptions.leftMiddleLeg,
    },
  };
};

const WorkspaceCollapseExpandMenu = (state, payload) => {
  let subMenuOpen = state.subMenuOpen;
  let subMenuOption = payload.subMenuOption;

  if (state.subMenuOption != subMenuOption) {
    subMenuOpen = true;
  } else {
    subMenuOpen = !subMenuOpen;
  }

  return {
    ...state,
    subMenuOpen: subMenuOpen,
    subMenuOption: subMenuOption,
  };
};

const WorkspaceMenuRestart = () => {
  return {
    mode: {
      sceneMode: 1,
      cameraMode: 0,
    },
    subMenuOpen: false,
    subMenuOption: null,
    menuOptions: {
      move: 0,
      redo: 1,
      undo: 2,
      mode: 3,
      draw: 4,
      trajectory: 5,
      angles: 6,
      zoom: 7,
      laser: 8,
      recordings: 9,
    },
    drawOptions: {
      show: false,
      drawPencilActive: true,
      drawEraserActive: false,
      brushRadius: 4,
      brushColor: "#2196F3",
      lastTimeClear: null,
      lastTimeUndo: null,
      lastTimeRedo: null,
    },
    laserOptions: {
      show: false,
      brushRadius: 15,
      brushColor: "#2196F3",
    },
    trajectoryOptions: {
      show: false,
      length: 50,
      density: 75,
      head: false,
      spine: false,
      rightShoulder: false,
      rightArm: false,
      rightHand: false,
      leftShoulder: false,
      leftArm: false,
      leftHand: false,
      hips: false,
      rightLeg: false,
      leftLeg: false,
    },
    angleOptions: {
      show: false,
      showGraph: false,
      rightUpperArm: false,
      rightMiddleArm: false,
      rightUpperLeg: false,
      rightMiddleLeg: false,
      leftUpperArm: false,
      leftMiddleArm: false,
      leftUpperLeg: false,
      leftMiddleLeg: false,
    },
  };
};

export const WorkspaceMenuReducer = createReducer(initialState, {
  [WorkspaceMenuTypes.WORKSPACE_LOAD]: WorkspaceLoad,
  [WorkspaceMenuTypes.WORKSPACE_UPDATE_SCENE_MODE]: MenuModeSceneUpdate,
  [WorkspaceMenuTypes.WORKSPACE_UPDATE_LASER_OPTIONS]: MenuLaserOptionsUpdate,
  [WorkspaceMenuTypes.WORKSPACE_UPDATE_DRAW_OPTIONS]: MenuDrawOptionsUpdate,
  [WorkspaceMenuTypes.WORKSPACE_CLEAR_DRAW]: MenuClearDraw,
  [WorkspaceMenuTypes.WORKSPACE_UNDO_DRAW]: MenuUndoDraw,
  [WorkspaceMenuTypes.WORKSPACE_REDO_DRAW]: MenuRedoDraw,
  [WorkspaceMenuTypes.WORKSPACE_UPDATE_TRAJECTORY_OPTIONS]:
    MenuTrajectoryOptionsUpdate,
  [WorkspaceMenuTypes.WORKSPACE_UPDATE_ANGLE_OPTIONS]: MenuAngleOptionsUpdate,
  [WorkspaceMenuTypes.WORKSPACE_COLLAPSE_EXPAND_MENU]:
    WorkspaceCollapseExpandMenu,
  [WorkspaceMenuTypes.WORKSPACE_RESTART]: WorkspaceMenuRestart,
});
