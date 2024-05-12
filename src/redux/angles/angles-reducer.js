import { createReducer } from "../utils";
import { AnglesTypes } from "./angles-types";

const initialState = {
  anglesChart: [],
  anglesDetails: [],
  chartUnderGeneration: false,
};

const anglesLoad = () => {
  return {
    ...initialState,
  };
};

const anglesAdd = (state, payload) => {
  return {
    ...state,
    anglesDetails: [
      ...state.anglesDetails,
      { name: payload.angle, student: [], ref: [] },
    ],
  };
};

const anglesDelete = (state, payload) => {
  return {
    ...state,
    recordingState: 0,
    anglesDetails: state.anglesDetails.filter(
      (angle) => angle.name != payload.angleName,
    ),
  };
};

const anglesDeleteAll = (state) => {
  return {
    ...state,
    anglesChart: [],
    anglesDetails: [],
  };
};

const anglesRestart = () => {
  return {
    anglesChart: [],
    anglesDetails: [],
    chartUnderGeneration: false,
  };
};

const anglesGenerateChartStarted = (state) => {
  return {
    ...state,
    anglesChart: [],
    anglesDetails: state.anglesDetails.map((angle) => {
      angle.student = [];
      angle.ref = [];
      return angle;
    }),
    chartUnderGeneration: true,
  };
};

const anglesGenerateChartFinished = (state) => {
  return {
    ...state,
    chartUnderGeneration: false,
  };
};

export const AnglesReducer = createReducer(initialState, {
  [AnglesTypes.ANGLES_LOAD]: anglesLoad,
  [AnglesTypes.ANGLES_ADD]: anglesAdd,
  [AnglesTypes.ANGLES_DELETE]: anglesDelete,
  [AnglesTypes.ANGLES_DELETE_ALL]: anglesDeleteAll,
  [AnglesTypes.ANGLES_GENERATE_CHART_START]: anglesGenerateChartStarted,
  [AnglesTypes.ANGLES_GENERATE_CHART_FINISH]: anglesGenerateChartFinished,
  [AnglesTypes.ANGLES_RESTART]: anglesRestart,
});
