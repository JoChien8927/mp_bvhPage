import { LoginTypes } from "./login-types";

const ValidateTokenStart = () => ({
  type: LoginTypes.VALIDATE_TOKEN_START,
  payload: {},
});

const LoginStart = (loginInfo) => ({
  type: LoginTypes.LOGIN_START,
  payload: {
    loginInfo: loginInfo,
  },
});

const LoginFinish = (userInfo, accessToken) => ({
  type: LoginTypes.LOGIN_FINISH,
  payload: {
    loginInfo: userInfo,
    accessToken: accessToken,
  },
});

const LoginOpenCreate = () => ({
  type: LoginTypes.LOGIN_OPEN_CREATE,
  payload: {},
});

const LoginCreateStart = (accountInfo, photoFile) => ({
  type: LoginTypes.LOGIN_CREATE_START,
  payload: {
    accountInfo: accountInfo,
    photoFile: photoFile,
  },
});

const LoginCreateFinish = (result, userInfo, accessToken) => ({
  type: LoginTypes.LOGIN_CREATE_FINISH,
  payload: {
    result: result,
    accessToken: accessToken,
    userInfo: userInfo,
  },
});

const LoginCreateModalClose = () => ({
  type: LoginTypes.LOGIN_MODAL_CLOSE,
  payload: {
    accountModalSuccess: false,
  },
});

const Logout = () => ({
  type: LoginTypes.LOGOUT,
  payload: {},
});

export const LoginAction = {
  ValidateTokenStart,
  LoginStart,
  LoginFinish,
  LoginCreateStart,
  LoginOpenCreate,
  LoginCreateFinish,
  LoginCreateModalClose,
  Logout,
};
