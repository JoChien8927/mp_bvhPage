import { LoginTypes } from "./login-types";
import { createReducer } from "../utils";

const initialState = {
  login: false,
  user: {},
  createAccountModalVisible: false,
};

const loginFinish = (state, payload) => {
  localStorage.setItem("accessToken", payload.accessToken);
  return {
    ...state,
    user: payload.loginInfo,
    login: true,
  };
};

const LoginOpenCreate = (state) => ({
  ...state,
  createAccountModalVisible: true,
});

const loginCreateFinish = (state, payload) => {
  localStorage.setItem("accessToken", payload.accessToken);
  return {
    ...state,
    user: { ...payload.userInfo },
    createAccountModalVisible: false,
    login: true,
  };
};

const loginCreateModalClose = (state) => ({
  ...state,
  createAccountModalVisible: false,
});

const logout = (state) => {
  localStorage.setItem("accessToken", "");

  return {
    ...state,
    user: {},
    login: false,
  };
};

export const LoginReducer = createReducer(initialState, {
  [LoginTypes.LOGIN_FINISH]: loginFinish,
  [LoginTypes.LOGIN_CREATE_FINISH]: loginCreateFinish,
  [LoginTypes.LOGIN_OPEN_CREATE]: LoginOpenCreate,
  [LoginTypes.LOGIN_MODAL_CLOSE]: loginCreateModalClose,
  [LoginTypes.LOGOUT]: logout,
});
