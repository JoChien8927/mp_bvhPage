import React from "react";
import "./user-new-pose-component.scss";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { UploadOutlined } from "@ant-design/icons";
import { Input, Select, Button, Modal, Upload } from "antd";

import { ReactSVG } from "react-svg";
import Grid from "@material-ui/core/Grid";
import { TrainingPoseAction } from "../../../redux/training-poses/training-poses-action";
const { Option } = Select;

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadPoseModal: false,
      newPose: {},
    };
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

    this.clearState();
  }

  clearState() {
    this.setState({
      uploadPoseModal: false,
      newPose: {},
    });
  }

  render() {
    return (
      <React.Fragment>
        <div className="user-new-pose">
          <div
            className="custom-button light"
            onClick={() => {
              this.setState({ uploadPoseModal: true, newPose: {} });
            }}
          >
            <ReactSVG className="button-icon" src="/img/icon_plus.svg" />
            <span>Upload New Pose</span>
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
              this.clearState();
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={3}>
                Sport Category
              </Grid>
              <Grid item xs={6} sm={8} md={9}>
                <Select
                  defaultValue=""
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
                  {this.state.newPose.sportCategory == "gym" && (
                    <Option value="#dead_lift">#dead_lift</Option>
                  )}
                  {this.state.newPose.sportCategory == "basketball" && (
                    <Option value="#set_shot">#set_shot</Option>
                  )}
                  {this.state.newPose.sportCategory == "basketball" && (
                    <Option value="#jump_shot">#jump_shot</Option>
                  )}
                  {this.state.newPose.sportCategory == "basketball" && (
                    <Option value="#passing_ball">#passing_ball</Option>
                  )}
                  {this.state.newPose.sportCategory == "boxing" && (
                    <Option value="#前手直拳">前手直拳</Option>
                  )}
                  {this.state.newPose.sportCategory == "boxing" && (
                    <Option value="#後手直拳">後手直拳</Option>
                  )}
                  {this.state.newPose.sportCategory == "boxing" && (
                    <Option value="#前手擺拳">前手擺拳</Option>
                  )}
                  {this.state.newPose.sportCategory == "boxing" && (
                    <Option value="#後手擺拳">後手擺拳</Option>
                  )}
                  {this.state.newPose.sportCategory == "boxing" && (
                    <Option value="#前手勾拳">前手勾拳</Option>
                  )}
                  {this.state.newPose.sportCategory == "boxing" && (
                    <Option value="#後手勾拳">後手勾拳</Option>
                  )}
                  {<Option value="#other">#other</Option>}
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
        </div>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);
const Redux = connect((store) => ({
  user: store.LoginReducer.user,
}))(Router);

export const UserNewPoseComponent = Redux;
