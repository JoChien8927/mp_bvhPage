import React from "react";
import { connect } from "react-redux";
import { Input, Form, notification } from "antd";
import { AlertComponent } from "../../components/alert-component/alert-component";
import { LoginAction } from "../../redux/login/login-action";
import { AlertAction } from "../../redux/alert/alert-action";
import { Translation } from "react-i18next";
import LanguageSelect from "./../../languageSelect";
import "./login.scss";
import { UserCreateComponent } from "../../components/user-create-component/user-create-component";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginUsername: "",
      loginPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
    };
  }

  render() {
    return (
      <Translation>
        {(t, { i18n }) => (
          <React.Fragment>
            {(() => {
              if (this.props.AlertReducer.show) return <AlertComponent />;
            })()}
            <div
              style={{
                minHeight: "100vh",
                margin: 0,
                width: "100vw",
                backgroundImage: `url(${
                  process.env.PUBLIC_URL + "/img/wallpaper.jpg"
                })`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                fontFamily: "Noto Sans TC, sans-serif",
              }}
            >
              <div
                style={{
                  height: "100vh",
                  width: "100vw",
                  backgroundColor: "black",
                  position: "fixed",
                  opacity: "0.3",
                }}
              />
              <LanguageSelect />

              <div
                style={{
                  position: "absolute",
                  padding: "40px",
                  width: "30%",
                  minWidth: "350px",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  borderRadius: "24px",
                  backgroundColor: "white",
                  opacity: "0.9",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "20px",
                    color: "black",
                  }}
                >
                  <img
                    style={{
                      height: "80px",
                    }}
                    src={process.env.PUBLIC_URL + "/img/logo.svg"}
                    alt="logo"
                  />
                  <div style={{ fontSize: "2em", marginTop: "10px" }}>
                    {t("login.title")}
                  </div>
                  <div
                    style={{ margin: "5px", fontWeight: 50, fontSize: "1em" }}
                  >
                    {t("login.subtitle")}
                  </div>
                </div>
                <Form size={"large"} name="basic">
                  <Form.Item
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Please input your username!",
                      },
                    ]}
                  >
                    <Input
                      placeholder={t("login.username")}
                      value={this.state.loginUsername}
                      onChange={(e) => {
                        this.setState({ loginUsername: e.target.value });
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input.Password
                      placeholder={t("login.password")}
                      value={this.state.loginPassword}
                      onChange={(e) => {
                        this.setState({ loginPassword: e.target.value });
                      }}
                    />
                  </Form.Item>
                </Form>
                <div style={{ padding: "10px" }}>
                  <button
                    className="skeleton-button"
                    onClick={() => {
                      if (
                        this.state.loginUsername === "" ||
                        this.state.loginPassword === ""
                      ) {
                        this.props.dispatch(
                          AlertAction.alertStart(
                            "Error",
                            "Empty username or password",
                          ),
                        );
                      } else {
                        this.props.dispatch(
                          LoginAction.LoginStart(
                            JSON.stringify({
                              username: this.state.loginUsername,
                              password: this.state.loginPassword,
                            }),
                          ),
                        );
                      }
                    }}
                  >
                    {t("login.login")}
                  </button>
                </div>
                <UserCreateComponent></UserCreateComponent>
              </div>
            </div>
          </React.Fragment>
        )}
      </Translation>
    );
  }
}

const Redux = connect((store) => ({
  LoginReducer: store.LoginReducer,
  AlertReducer: store.AlertReducer,
}))(Component);

export const LoginPage = Redux;
