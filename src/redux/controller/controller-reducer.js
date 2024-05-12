import { createReducer } from "../utils";
import { ControllerTypes } from "./controller-types";

const initialState = {
  controller: {},
};

const controllerFetchFinish = (state, payload) => ({
  ...state,
  controller: payload.controller,
});

export const ControllerReducer = createReducer(initialState, {
  [ControllerTypes.CONTROLLER_FETCH_FINISH]: controllerFetchFinish,
});
