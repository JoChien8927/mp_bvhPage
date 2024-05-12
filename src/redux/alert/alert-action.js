import { AlertType } from "./alert-types";

const alertStart = (title, message) => ({
  type: AlertType.ALERT_START,
  payload: {
    title: title,
    message: message,
    show: true,
  },
});

const alertStop = () => ({
  type: AlertType.ALERT_STOP,
  payload: {},
});

export const AlertAction = {
  alertStart,
  alertStop,
};
