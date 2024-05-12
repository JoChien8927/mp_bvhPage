import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./user-friends-component.scss";

import { LoadingOutlined } from "@ant-design/icons";
import { Input, Select, Button, Modal, Upload, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import Grid from "@material-ui/core/Grid";
import { ReactSVG } from "react-svg";
import { TrainingPoseAction } from "../../redux/training-poses/training-poses-action";

const { Option } = Select;
const antIcon = <LoadingOutlined style={{ fontSize: 35 }} spin />;

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadPoseModal: false,
      newPose: {},
    };
  }

  menuItemActive(option) {
    return this.state.active[option] ? "menu-item active" : "menu-item";
  }

  onUploadFile(event) {
    this.setState({
      newPose: {
        ...this.state.newPose,
        file: event.file,
        fileType: event.file.name.toLowerCase().includes(".bvh")
          ? "bvh"
          : "mp4",
      },
    });
  }

  createPose(event) {
    if (this.state.sessionID !== "") {
      this.props.dispatch(
        TrainingPoseAction.TrainingPoseCreateStart(
          this.props.user._id,
          this.state.newPose.description,
          this.state.newPose.sportCategory,
          this.state.newPose.skillType,
          this.state.newPose.file,
          this.state.newPose.fileType,
        ),
      );
    }
    this.clearState();
  }

  clearState() {
    this.setState({
      uploadPoseModal: false,
      newPose: {},
    });
  }

  render() {
    var options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return (
      <React.Fragment>
        <div className="container">
          <div className="controls">
            <Input
              className="search-bar"
              // size="large"
              placeholder="Entering here to search files"
              prefix={
                <ReactSVG className="search-icon" src="/img/icon_search.svg" />
              }
              onChange={(value) => {
                this.setState({ search: value });
              }}
            />
            <Select
              className="dropdown-bar"
              defaultValue={"Sorted by Ｍodified Date"}
              onChange={(value) => {
                this.setState({
                  sortBy: { sortBy: value },
                });
              }}
            >
              <Option value="modifiedDate">Sorted by Ｍodified Date</Option>
              <Option value="uploadDate">Sorted by Uploaded Date</Option>
            </Select>
            <div
              className="add-button"
              onClick={() => {
                this.setState({ uploadPoseModal: true, newPose: {} });
              }}
            >
              <ReactSVG className="button-icon" src="/img/icon_plus.svg" />
              <span>Upload New Pose</span>
            </div>
          </div>

          <div className="poses">
            <Grid container spacing={2}>
              {this.props.TrainingPoseReducer.trainingPoses.map((session) => {
                return (
                  <Grid key={session._id} item xs={12} sm={6} md={3}>
                    <div className="pose-wrapper">
                      <div className="pose-header">
                        <img
                          className="pose-user-image"
                          src={process.env.PUBLIC_URL + "/img/user_example.png"}
                        />
                        <div className="pose-info">
                          <div className="user-name">
                            {this.props.user.firstName}{" "}
                            {this.props.user.lastName}
                          </div>
                          <div className="pose-updates">
                            Modified on{" "}
                            {new Date(session.updatedAt).toLocaleDateString(
                              "en-US",
                              options,
                            )}
                          </div>
                        </div>
                        <div className="pose-options">
                          <ReactSVG
                            className="pose-options-icon"
                            src="/img/icon_three_dots.svg"
                          />
                        </div>
                      </div>
                      <div className="pose-preview">
                        {(() => {
                          if (!session.processCompleted) {
                            return <Spin indicator={antIcon} />;
                          } else if (session.sourceType === "mp4") {
                            return (
                              <div
                                className="pose-preview-image"
                                style={{
                                  backgroundImage: `url(${
                                    process.env.PUBLIC_URL +
                                    "/api/files/mediapipe-pose/" +
                                    session._id +
                                    "/image-00001.jpeg"
                                  })`,
                                }}
                              ></div>
                            );
                          }
                        })()}
                      </div>
                      <div className="pose-footer">
                        <div className="pose-name">{session.description}</div>
                        <div className="pose-tags">{session.skillType}</div>
                        <div className="duration">
                          {this.props.pose.duration}
                        </div>
                        <div className="pose-button">Pose Analysis</div>
                      </div>
                    </div>
                  </Grid>
                );
              })}
            </Grid>
          </div>
        </div>

        <Modal
          centered={true}
          maskClosable={false}
          destroyOnClose={true}
          title="Upload New Pose"
          open={this.state.uploadPoseModal}
          okText="Save"
          onOk={(event) => {
            this.createPose(event);
          }}
          onCancel={(event) => {
            this.clearState(event);
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}>
              Sport Category
            </Grid>
            <Grid item xs={6} sm={8} md={9}>
              <Select
                defaultValue={""}
                style={{ width: "100%" }}
                onChange={(value) => {
                  this.setState({
                    newPose: { ...this.state.newPose, sportCategory: value },
                  });
                }}
              >
                <Option value="basketball">Basketball</Option>
                <Option value="boxing">Boxing</Option>
                <Option value="gym">Gym Workout</Option>
                <Option value="tableTennis">Table Tennis</Option>
              </Select>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              Skill Type
            </Grid>
            <Grid item xs={6} sm={8} md={9}>
              <Select
                defaultValue={""}
                style={{ width: "100%" }}
                onChange={(value) => {
                  this.setState({
                    newPose: { ...this.state.newPose, skillType: value },
                  });
                }}
              >
                <Option value="#dead_lift">#dead_lift</Option>
                <Option value="#set_shot">#set_shot</Option>
                <Option value="#jump_shot">#jump_shot</Option>
                <Option value="#passing_ball">#passing_ball</Option>
                <Option value="#other">#other</Option>
              </Select>
            </Grid>{" "}
            <Grid item xs={6} sm={4} md={3}>
              Description
            </Grid>
            <Grid item xs={6} sm={8} md={9}>
              <Input
                placeholder={"Pose Description"}
                style={{ width: "100%" }}
                onChange={(e) => {
                  this.setState({
                    newPose: {
                      ...this.state.newPose,
                      description: e.target.value,
                    },
                  });
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              File
            </Grid>
            <Grid item xs={6} sm={8} md={9}>
              <Upload
                customRequest={(event) => this.onUploadFile(event)}
                accept=".mp4,.bvh"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Grid>
          </Grid>
        </Modal>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({
  user: store.LoginReducer.user,
  StudentReducer: store.StudentReducer,
  TrainingPoseReducer: store.TrainingPoseReducer,
  TrainingPoseReducer: store.TrainingPoseReducer,
  processingVideoIds: store.TrainingPoseReducer.processingVideoIds,
}))(Router);

export const UserTeamsComponent = Redux;
