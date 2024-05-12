import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Badge, Drawer, Dropdown, Input, Menu, Space } from "antd";
import "./main-header-component.scss";
import { ReactSVG } from "react-svg";
import { LoginAction } from "../../redux/login/login-action";
import { MainMenuComponent } from "./main-menu-component/main-menu-component";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDrawerOpened: false,
    };
  }

  // menuItemActive(option) {
  //   return this.state.active[option] == this.props.headerKey
  //     ? "menu-item active"
  //     : "menu-item";
  // }

  menuItemSelected(option) {
    this.props.history.push("/" + option);
  }

  handleMenuClick(event) {
    switch (event.key) {
      case "1":
        this.props.dispatch(LoginAction.Logout());
        this.props.history.push("/");
        break;

      default:
        break;
    }
  }

  render() {
    const menu = (
      <Menu
        onClick={(info) => this.handleMenuClick(info)}
        items={[
          {
            key: "1",
            label: "Log Out",
          },
        ]}
      />
    );
    return (
      <React.Fragment>
        <div className="main-header">
          {(() => {
            if (this.state.isDrawerOpened) {
              return (
                <Drawer
                  width="350px"
                  placement="left"
                  closable={false}
                  onClose={() => {
                    this.setState({
                      isDrawerOpened: !this.state.isDrawerOpened,
                    });
                  }}
                  open={true}
                >
                  <div>
                    <MainMenuComponent headerKey={this.props.headerKey} />
                  </div>
                </Drawer>
              );
            }
          })()}
          <div className="header-icon-district">
            <Space size="large">
              <img
                onClick={() => {
                  this.setState({ isDrawerOpened: !this.state.isDrawerOpened });
                }}
                src={process.env.PUBLIC_URL + "/img/collapse.svg"}
                width={20}
                height={20}
              />
              <img
                onClick={() => this.menuItemSelected("poses")}
                src={process.env.PUBLIC_URL + "/img/logo.svg"}
                width={30}
                height={30}
              />
            </Space>
            <div className="input-district">
              <Input
                className="search-bar"
                placeholder="Search friends"
                prefix={
                  <ReactSVG
                    className="search-icon"
                    src="/img/icon_search.svg"
                  />
                }
              />
            </div>
          </div>
          <div className="options">
            {" "}
            {/* <div className="option">
              <Badge dot>
                <ReactSVG className="option-icon" src="/img/icon_mail.svg" />
              </Badge>
            </div>
            <div className="option">
              <Badge>
                <ReactSVG
                  className="option-icon"
                  src="/img/icon_accessibility.svg"
                />
              </Badge>
            </div>
            <div className="option">
              <Badge>
                <ReactSVG
                  className="option-icon"
                  src="/img/icon_question.svg"
                />
              </Badge>
            </div> */}
            <div className="option">
              <Dropdown trigger="click" placement="bottomRight" overlay={menu}>
                {/*overlay can not change to menu, it will error*/}
                <img
                  className="user-image"
                  src={
                    this.props.user.photoFile
                      ? process.env.PUBLIC_URL +
                        "/api/files/profile-photos/" +
                        this.props.user.photoFile
                      : process.env.PUBLIC_URL + "/img/user_example.png"
                  }
                />
              </Dropdown>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({
  user: store.LoginReducer.user,
}))(Router);

export const MainHeaderComponent = Redux;
