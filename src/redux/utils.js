export const createReducer =
  (initialState, handlers) =>
  (state = initialState, action) => {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action.payload);
    } else {
      return state;
    }
  };

export const getHeaders = (jsonBody) => {
  let headers = { "x-access-token": localStorage.getItem("accessToken") };

  if (jsonBody)
    headers = { ...headers, "Content-type": "application/json; charset=UTF-8" };

  return headers;
};
