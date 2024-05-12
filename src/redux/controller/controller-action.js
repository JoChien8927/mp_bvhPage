import { ControllerTypes } from "./controller-types";

const controllerFetchStart = (userId) => ({
  type: ControllerTypes.CONTROLLER_FETCH_START,
  payload: {
    userId: userId,
  },
});

const controllerFetchFinish = (controller) => ({
  type: ControllerTypes.CONTROLLER_FETCH_FINISH,
  payload: {
    controller: controller,
  },
});

const controllerUpdateStart = (userId, controller) => ({
  type: ControllerTypes.CONTROLLER_UPDATE_START,
  payload: {
    userId: userId,
    controller: controller,
  },
});

const controllerUpdateFinish = (controller) => ({
  type: ControllerTypes.CONTROLLER_UPDATE_FINISH,
  payload: {
    controller: controller,
  },
});

export const ControllerAction = {
  controllerFetchStart,
  controllerFetchFinish,
  controllerUpdateStart,
  controllerUpdateFinish,
};
