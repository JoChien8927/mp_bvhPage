import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./user-card-component.scss";

import { Select, Dropdown, Menu } from "antd";

import Grid from "@material-ui/core/Grid";

import { ReactSVG } from "react-svg";

const { Option } = Select;

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleMenuClick(event) {
    switch (event.key) {
      case "1":
        // this.deletePose();
        break;

      default:
        break;
    }
  }

  acceptRequest() {}

  render() {
    const dateOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    const menu = (
      <Menu
        onClick={(info) => this.handleMenuClick(info)}
        items={[
          {
            key: "1",
            label: "Delete",
          },
        ]}
      />
    );

    return (
      <React.Fragment>
        <Grid
          className="user-card"
          key={this.props.user._id}
          item
          xs={6}
          sm={4}
          md={3}
          lg={2}
        >
          <div className="user-wrapper">
            <div className="user-header">
              <div className="user-options">
                <Dropdown
                  trigger="click"
                  placement="bottomRight"
                  overlay={menu}
                >
                  <ReactSVG
                    className="user-options-icon"
                    src="/img/icon_three_dots.svg"
                  />
                </Dropdown>
              </div>
            </div>
            <div className="user-info">
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
              <div className="user-name">
                {this.props.user.firstName} {this.props.user.lastName}
              </div>
              {/* <div className="user-username">@{this.props.user.username}</div> */}
              <div className={"user-status " + this.props.user.status}>
                {this.props.user.status == "accepted"
                  ? "Friends"
                  : "Request Sent"}
              </div>
              <div className="user-date">
                {this.props.user.status == "accepted"
                  ? "Friend since "
                  : "Requested on "}
                {new Date(this.props.user.updatedAt).toLocaleDateString(
                  "en-US",
                  dateOptions,
                )}
              </div>
            </div>
          </div>
        </Grid>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({}))(Router);

export const UserCardComponent = Redux;
