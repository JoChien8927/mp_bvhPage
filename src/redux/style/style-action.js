import { StyleTypes } from "./style-types";

const Resize = (clientHeight) => ({
  type: StyleTypes.RESIZE,
  payload: {
    clientHeight: clientHeight,
  },
});

export const StyleAction = {
  Resize,
};
