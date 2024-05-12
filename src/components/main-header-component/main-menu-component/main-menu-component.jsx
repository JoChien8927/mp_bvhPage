import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Badge } from "antd";
import "./main-menu-component.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: {
        poses: 0,
        friends: 1,
        teams: 2,
        helps: 3,
        inbox: 4,
      },
    };
  }

  menuItemActive(option) {
    return this.state.active[option] == this.props.headerKey
      ? "main-menu-option active"
      : "main-menu-option";
  }

  menuItemSelected(option) {
    this.props.history.push("/" + option);
  }

  render() {
    return (
      <React.Fragment>
        <div className="main-menu-container">
          <div className="main-menu-user-profile">
            <div
              className="user-profile-photo"
              style={{
                backgroundImage: `url(${
                  this.props.user.photoFile
                    ? process.env.PUBLIC_URL +
                      "/api/files/profile-photos/" +
                      this.props.user.photoFile
                    : process.env.PUBLIC_URL + "/img/user_example.png"
                })`,
              }}
            ></div>
            <div className="main-menu-user-info-district">
              <div className="user-name">
                {this.props.user.firstName} {this.props.user.lastName}
              </div>
              <div className="user-username">@{this.props.user.username}</div>
            </div>
          </div>
          <div className="mmc-button-edit-profile">
            <div className="custom-button light text-center">Edit Profile</div>
          </div>
          <div className="district-divide" />
          <div className="main-menu-option-district">
            <div className="main-menu-badge">
              <Badge />
            </div>
            <div className="main-menu-option-wrapper">
              <div
                className={this.menuItemActive("poses")}
                onClick={() => {
                  this.menuItemSelected("poses");
                }}
              >
                My Pose Videos
              </div>
            </div>
          </div>
          <div className="main-menu-option-district">
            <div className="main-menu-badge">
              <Badge />
            </div>
            <div className="main-menu-option-wrapper">
              <div
                className={this.menuItemActive("friends")}
                onClick={() => {
                  this.menuItemSelected("friends");
                }}
              >
                My Friends
              </div>
            </div>
          </div>
          <div className="main-menu-option-district">
            <div className="main-menu-badge">
              <Badge />
            </div>
            <div className="main-menu-option-wrapper">
              <div
                className={this.menuItemActive("teams")}
                onClick={() => {
                  this.menuItemSelected("teams");
                }}
              >
                My Teams
              </div>
            </div>
          </div>
          <div className="district-divide" />
          <div className="main-menu-option-district">
            <div className="main-menu-badge">
              <Badge />
            </div>
            <div className="main-menu-option-wrapper">
              <div className={this.menuItemActive("helps")} onClick={() => {}}>
                Help & FAQs
              </div>
            </div>
          </div>
          <div className="main-menu-option-district">
            <div className="main-menu-badge">
              <Badge color="#f50" />
            </div>
            <div className="main-menu-option-wrapper">
              <div className={this.menuItemActive("inbox")} onClick={() => {}}>
                Inbox
              </div>
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

export const MainMenuComponent = Redux;
