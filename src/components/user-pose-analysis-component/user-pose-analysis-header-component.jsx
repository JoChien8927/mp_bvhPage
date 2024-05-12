import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Dropdown, Input, Menu } from "antd";
import { TrainingPoseAction } from "../../redux/training-poses/training-poses-action";
import { PoseAnalysisAction } from "../../redux/pose-analysis/pose-analysis-action";
import "./user-pose-analysis-component.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      title: "",
    };
    this.newAnalysis = this.newAnalysis.bind(this);
  }

  newAnalysis() {
    this.props.history.push("/poses/" + this.props.poseId + "/new-analysis");
  }

  editTitle() {
    this.setState({ isEdit: true, title: this.props.currentPose.description });
  }

  editConfirm(option) {
    const pose = this.props.currentPose;

    if (option == "save") {
      this.setState({ isEdit: false });
      pose.description = this.state.title;
      this.props.dispatch(PoseAnalysisAction.EditPoseStart(pose, pose._id));
    } else if (option == "delete") {
      this.props.dispatch(
        TrainingPoseAction.TrainingPoseDeleteStart(
          this.props.currentPose.user._id,
          this.props.currentPose._id,
        ),
      );
    }
  }

  handleMenuClick(option) {
    switch (option.key) {
      case "0":
        this.editTitle();
        break;
      case "1":
        this.editConfirm("delete");
        this.props.history.push("/");
        break;
      default:
        break;
    }
  }

  render() {
    const dropdownOption = (
      <Menu
        onClick={(option) => {
          this.handleMenuClick(option);
        }}
        items={[
          { key: "0", label: "Edit" },
          { key: "1", label: "Delete" },
        ]}
      />
    );
    return (
      <React.Fragment>
        <div className="upahc-container">
          <div className="upac-icon-three-wrapper">
            <div className="upac-icon-three">
              <Dropdown
                placement="bottomLeft"
                trigger="click"
                overlay={dropdownOption}
              >
                <img
                  src={process.env.PUBLIC_URL + "/img/icon_three_dots.svg"}
                  width={20}
                  height={20}
                />
              </Dropdown>
            </div>
          </div>
          <div
            className="upahc-user-photo"
            style={{
              backgroundImage: `url(${
                this.props.currentPose.user.photoFile
                  ? process.env.PUBLIC_URL +
                    "/api/files/profile-photos/" +
                    this.props.currentPose.user.photoFile
                  : process.env.PUBLIC_URL + "/img/user_example.png"
              })`,
            }}
          ></div>
          <div className="upahc-video-title-wrapper">
            {this.state.isEdit ? (
              <div className="upahc-edit-confirm-wrapper">
                <Input
                  className="upahc-video-title-input"
                  value={this.state.title}
                  onChange={(e) => {
                    this.setState({
                      title: e.target.value,
                    });
                  }}
                />
                <div>
                  <div
                    className="custom-button primary text-center"
                    onClick={() => {
                      this.editConfirm("save");
                    }}
                  >
                    save
                  </div>
                  <div
                    className="custom-button light"
                    onClick={() => {
                      this.setState({ isEdit: false });
                    }}
                  >
                    cancel
                  </div>
                </div>
              </div>
            ) : (
              <div className="upahc-video-title">
                {this.props.currentPose.description}
              </div>
            )}
          </div>
          <div className="upahc-button-new-pose-analysis">
            <div
              className="custom-button primary text-center"
              onClick={() => this.newAnalysis()}
            >
              Start a new pose analysis
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({
  currentPose: store.PoseAnalysisReducer.currentPose,
  userId: store.PoseAnalysisReducer.userId,
  poseId: store.PoseAnalysisReducer.poseId,
}))(Router);

export const UserPoseAnalysisHeaderComponent = Redux;
