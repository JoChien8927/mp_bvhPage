import { AnglesTypes } from "./angles-types";
import { Store } from "../store";

const anglesLoad = () => {
  Store.dispatch({
    type: AnglesTypes.ANGLES_LOAD,
    payload: {},
  });
};

const anglesAdd = (angle) => ({
  type: AnglesTypes.ANGLES_ADD,
  payload: {
    angle: angle,
  },
});

const anglesDelete = (angleName) => ({
  type: AnglesTypes.ANGLES_DELETE,
  payload: {
    angleName: angleName,
  },
});

const anglesDeleteAll = () => ({
  type: AnglesTypes.ANGLES_DELETE_ALL,
  payload: {},
});

const anglesRestart = () => ({
  type: AnglesTypes.ANGLES_RESTART,
  payload: {},
});

const anglesGenerateChartStarted = () => ({
  type: AnglesTypes.ANGLES_GENERATE_CHART_START,
  payload: {},
});

const anglesGenerateChartFinished = () => ({
  type: AnglesTypes.ANGLES_GENERATE_CHART_FINISH,
  payload: {},
});

export const AnglesActions = {
  anglesLoad,
  anglesAdd,
  anglesDelete,
  anglesDeleteAll,
  anglesGenerateChartStarted,
  anglesGenerateChartFinished,
  anglesRestart,
};
