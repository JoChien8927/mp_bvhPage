import React from "react";
import { connect } from "react-redux";
import { Joystick, JoystickShape } from "react-joystick-component";
import Tilt from "react-parallax-tilt";
import { LoginAction } from "../../redux/login/login-action";
import { SettingOutlined, FireOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Slider, InputNumber, Dropdown, Menu } from "antd";
import { ControllerAction } from "../../redux/controller/controller-action";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      angleX: 0,
      angleY: 0,
      movement: "NONE",
      shoot: false,
      fireRate: 0.5,
      force: 1,
      levitation: 0,
    };
  }

  updateController() {
    this.props.dispatch(
      ControllerAction.controllerUpdateStart(
        this.props.LoginReducer.user._id,
        JSON.stringify(this.state),
      ),
    );
  }

  componentDidMount() {
    if (!this.props.LoginReducer.login) {
      this.props.history.push("/");
    }
    this.updateController();
  }

  render() {
    return (
      <React.Fragment>
        <div
          style={{
            color: "white",
            position: "absolute",
            right: "20px",
            top: "20px",
          }}
        >
          <Dropdown
            overlay={() => {
              return (
                <Menu>
                  <Menu.Item>Settings</Menu.Item>
                  <Menu.Item>
                    <a
                      onClick={() => {
                        this.props.dispatch(LoginAction.Logout());
                        this.props.history.push("/");
                      }}
                    >
                      Logout
                    </a>
                  </Menu.Item>
                </Menu>
              );
            }}
          >
            <Button
              icon={<SettingOutlined />}
              size="large"
              style={{ background: "#329D9C", borderColor: "#C8EAD1" }}
              type="primary"
            />
          </Dropdown>
        </div>
        <div
          style={{
            backgroundColor: "#01303f",
            width: "100vw",
            height: "100vh",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: "70px",
            }}
          >
            <div
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                backgroundColor: "white",
              }}
            >
              <Tilt
                tiltAngleXManual={-1 * this.state.angleX}
                tiltAngleYManual={this.state.angleY}
                glareEnable={false}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    alignContent: "center",
                  }}
                >
                  <img
                    style={{ height: "180px", paddingTop: "10px" }}
                    src={process.env.PUBLIC_URL + "/img/racket.png"}
                  />
                </div>
              </Tilt>
            </div>
            <div
              style={{
                color: "white",
                fontSize: "20px",
                textAlign: "center",
                padding: "30px",
              }}
            >
              <span>Axis x: {this.state.angleX.toFixed(0)}°, </span>
              <span>Axis y: {this.state.angleY.toFixed(0)}°</span>
              <div>
                Movement:{" "}
                <b style={{ color: "#89d6fb" }}>{this.state.movement}</b>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              width: "100vw",
            }}
          >
            <div style={{ color: "white", width: "70px" }}>Fire Rate:</div>
            <Slider
              style={{ width: "30%" }}
              min={0}
              max={5}
              step={0.1}
              value={this.state.fireRate}
              onChange={(val) => {
                this.setState({ fireRate: val }, () => {
                  this.updateController();
                });
              }}
            />
            <InputNumber value={this.state.fireRate} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              width: "100vw",
              paddingTop: "5px",
            }}
          >
            <div style={{ color: "white", width: "70px" }}>Force:</div>
            <Slider
              style={{ width: "30%" }}
              min={0}
              max={2}
              step={0.1}
              value={this.state.force}
              onChange={(val) => {
                this.setState({ force: val }, () => {
                  this.updateController();
                });
              }}
            />
            <InputNumber value={this.state.force} />
          </div>
          <div
            style={{
              position: "fixed",
              bottom: "50px",
              display: "flex",
              flexDirection: "row",
              width: "100vw",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "31%",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Joystick
                baseShape={JoystickShape.Square}
                stickShape={JoystickShape.Square}
                size={80}
                sticky={false}
                baseColor={"#d4f0fc"}
                stickColor={"#89d6fb"}
                move={(stick) => {
                  this.setState({ movement: stick.direction }, () => {
                    this.updateController();
                  });
                }}
                stop={() => {
                  this.setState({ movement: "NONE" }, () => {
                    this.updateController();
                  });
                }}
              />
              <div
                style={{
                  fontSize: "20px",
                  color: "#d4f0fc",
                  marginTop: "10px",
                }}
              >
                Movement
              </div>
            </div>
            <div
              style={{
                width: "7%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Slider
                style={{
                  height: 70,
                }}
                vertical
                min={0}
                max={0.3}
                step={0.01}
                value={this.state.levitation}
                onChange={(val) => {
                  this.setState({ levitation: val }, () => {
                    this.updateController();
                  });
                }}
              />
              <div
                style={{
                  fontSize: "20px",
                  color: "#d4f0fc",
                  marginTop: "10px",
                }}
              >
                Up
              </div>
            </div>
            <div
              style={{
                width: "31%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Button
                onClick={() => {
                  this.setState({ shoot: !this.state.shoot }, () => {
                    this.updateController();
                  });
                }}
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: "#801100",
                  borderColor: "#D73502",
                }}
              >
                {(() => {
                  if (this.state.shoot) {
                    return (
                      <StopOutlined
                        style={{ fontSize: 30, color: "#FAC000" }}
                      />
                    );
                  } else {
                    return (
                      <FireOutlined
                        style={{ fontSize: 30, color: "#FAC000" }}
                      />
                    );
                  }
                })()}
              </Button>
              <div
                style={{
                  fontSize: "20px",
                  color: "#FAC000",
                  marginTop: "10px",
                }}
              >
                {(() => {
                  if (this.state.shoot) return "Stop";
                  else return "Shoot";
                })()}
              </div>
            </div>
            <div
              style={{
                width: "31%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Joystick
                size={80}
                sticky={true}
                baseColor={"#FFFF99"}
                stickColor={"#FFD300"}
                move={(stick) => {
                  this.setState(
                    {
                      angleX: stick.y,
                      angleY: stick.x,
                    },
                    () => {
                      this.updateController();
                    },
                  );
                }}
              />
              <div
                style={{
                  fontSize: "20px",
                  color: "#FFFF99",
                  marginTop: "10px",
                }}
              >
                Angle
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  LoginReducer: store.LoginReducer,
  ControllerReducer: store.ControllerReducer,
}))(Component);

export const ControlPage = Redux;
