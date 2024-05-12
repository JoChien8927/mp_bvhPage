import { createReducer } from "../utils";
import { AlertType } from "./alert-types";

const initialState = {
  message: "",
  title: "",
  show: false,
};

const alertStart = (state, payload) => ({
  ...state,
  message: payload.message,
  title: payload.title,
  show: true,
});

const alertStop = (state) => ({
  ...state,
  message: "",
  show: false,
});

export const AlertReducer = createReducer(initialState, {
  [AlertType.ALERT_START]: alertStart,
  [AlertType.ALERT_STOP]: alertStop,
});
