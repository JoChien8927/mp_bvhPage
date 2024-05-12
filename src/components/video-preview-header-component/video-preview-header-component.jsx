import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { Avatar, Badge, Dropdown, Menu, Modal, Button } from "antd";
import "./video-preview-header-component.scss";
import { TrainingPoseAction } from "../../redux/training-poses/training-poses-action";
import { ReactSVG } from "react-svg";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  deletePose() {
    this.props.dispatch(
      TrainingPoseAction.TrainingPoseDeleteStart(
        this.props.pose.user._id,
        this.props.pose._id,
      ),
    );
  }

  handleMenuClick(event) {
    switch (event.key) {
      case "1":
        this.deletePose();
        break;

      default:
        break;
    }
  }

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
        <div
          className={"video-preview-header " + this.props.size}
          style={{
            paddingTop: this.props.paddingTop,
            paddingBottom: this.props.paddingBottom,
          }}
        >
          <img
            className="user-image"
            src={
              this.props.pose.user.photoFile
                ? process.env.PUBLIC_URL +
                  "/api/files/profile-photos/" +
                  this.props.pose.user.photoFile
                : process.env.PUBLIC_URL + "/img/user_example.png"
            }
          />
          <div className="info">
            <div className="user-name">
              {this.props.pose.user.firstName} {this.props.pose.user.lastName}
            </div>
            <div className="date">
              Modified on{" "}
              {new Date(this.props.pose.updatedAt).toLocaleDateString(
                "en-US",
                dateOptions,
              )}
            </div>
          </div>
          {(() => {
            if (this.props.showOptions) {
              return (
                <React.Fragment>
                  <div className="options">
                    <Dropdown
                      trigger="click"
                      placement="bottomRight"
                      overlay={menu}
                    >
                      <ReactSVG
                        className="options-icon"
                        src="/img/icon_three_dots.svg"
                      />
                    </Dropdown>
                  </div>
                </React.Fragment>
              );
            }
          })()}
        </div>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({}))(Router);

export const VideoPreviewHeaderComponent = Redux;
