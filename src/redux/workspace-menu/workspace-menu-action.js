import { WorkspaceMenuTypes } from "./workspace-menu-types";
import { Store } from "../store";

const WorkspaceLoad = () => {
  Store.dispatch({
    type: WorkspaceMenuTypes.WORKSPACE_LOAD,
    payload: {},
  });
};

const WorkspaceUpdateSceneMode = (sceneMode) => ({
  type: WorkspaceMenuTypes.WORKSPACE_UPDATE_SCENE_MODE,
  payload: {
    sceneMode: sceneMode,
  },
});

const WorkspaceUpdateLaserOptions = (laserOptions) => ({
  type: WorkspaceMenuTypes.WORKSPACE_UPDATE_LASER_OPTIONS,
  payload: {
    laserOptions: laserOptions,
  },
});

const WorkspaceUpdateDrawOptions = (drawOptions) => ({
  type: WorkspaceMenuTypes.WORKSPACE_UPDATE_DRAW_OPTIONS,
  payload: {
    drawOptions: drawOptions,
  },
});

const WorkspaceClearDraw = () => ({
  type: WorkspaceMenuTypes.WORKSPACE_CLEAR_DRAW,
  payload: {},
});

const WorkspaceUndoDraw = () => ({
  type: WorkspaceMenuTypes.WORKSPACE_UNDO_DRAW,
  payload: {},
});

const WorkspaceRedoDraw = () => ({
  type: WorkspaceMenuTypes.WORKSPACE_REDO_DRAW,
  payload: {},
});

const WorkspaceUpdateTrajectoryOptions = (trajectoryOptions) => ({
  type: WorkspaceMenuTypes.WORKSPACE_UPDATE_TRAJECTORY_OPTIONS,
  payload: {
    trajectoryOptions: trajectoryOptions,
  },
});

const WorkspaceUpdateAngleOptions = (angleOptions) => ({
  type: WorkspaceMenuTypes.WORKSPACE_UPDATE_ANGLE_OPTIONS,
  payload: {
    angleOptions: angleOptions,
  },
});

const WorkspaceCollapseExpandMenu = (subMenuOption) => ({
  type: WorkspaceMenuTypes.WORKSPACE_COLLAPSE_EXPAND_MENU,
  payload: {
    subMenuOption: subMenuOption,
  },
});

const WorkspaceResize = () => ({
  type: WorkspaceMenuTypes.WORKSPACE_RESIZE,
});

const WorkspaceMenuRestart = () => ({
  type: WorkspaceMenuTypes.WORKSPACE_RESTART,
});

export const WorkspaceMenuActions = {
  WorkspaceLoad,
  WorkspaceUpdateSceneMode,
  WorkspaceUpdateLaserOptions,
  WorkspaceUpdateDrawOptions,
  WorkspaceClearDraw,
  WorkspaceUndoDraw,
  WorkspaceRedoDraw,
  WorkspaceUpdateTrajectoryOptions,
  WorkspaceUpdateAngleOptions,
  WorkspaceCollapseExpandMenu,
  WorkspaceResize,
  WorkspaceMenuRestart,
};
