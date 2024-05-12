import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Dropdown, Menu } from "antd";
import { PoseAnalysisAction } from "../../redux/pose-analysis/pose-analysis-action";
import "./user-pose-analysis-component.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      comment: "",
    };
  }

  editComment() {
    this.setState({
      isEdit: true,
      comment: this.props.pose.comments[this.props.commentIndex].comment,
    });
  }

  editConfirm(option) {
    const pose = this.props.pose;

    if (option == "save") {
      this.setState({ isEdit: false });
      pose.comments[this.props.commentIndex].comment = this.state.comment;
    } else if (option == "delete") {
      pose.comments.splice(this.props.commentIndex, 1);
    }

    // call action to update pose(whole data)
    this.props.dispatch(PoseAnalysisAction.EditPoseStart(pose, pose._id));
  }

  handleMenuClick(event) {
    switch (event.key) {
      case "0":
        this.editComment();
        break;
      case "1":
        this.editConfirm("delete");
        break;

      default:
        break;
    }
  }

  render() {
    const dropdownOption = (
      <Menu
        onClick={(option) => this.handleMenuClick(option)}
        items={[
          {
            key: "0",
            label: "Edit",
          },
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
          className="upabc-instruction-comment"
          onClick={() => {
            this.props.clickHandler(this.props.commentIndex);
          }}
        >
          <div
            className={
              this.props.commentIndex == this.props.previousIndex
                ? "upabc-ic-card-container active"
                : "upabc-ic-card-container"
            }
          >
            <div className="upabc-ic-card-header-wrapper">
              <div className="upabc-ic-card-header-time">
                {this.props.durationFormat(
                  this.props.pose.comments[this.props.commentIndex].time / 1000,
                )}
                {/* -{this.props.durationFormat(5)} */}
              </div>
              <div
                className="upabc-ic-card-header-instructor-photo"
                style={{
                  backgroundImage: `url(${
                    this.props.pose.comments[this.props.commentIndex].user
                      .photoFile
                      ? process.env.PUBLIC_URL +
                        "/api/files/profile-photos/" +
                        this.props.pose.comments[this.props.commentIndex].user
                          .photoFile
                      : process.env.PUBLIC_URL + "/img/user_example.png"
                  })`,
                }}
              ></div>
              <div className="upac-icon-three-wrapper">
                <div className="upac-icon-three">
                  <Dropdown
                    placement="bottomRight"
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
            </div>
            <div className="upabc-ic-card-footer-comment">
              {this.state.isEdit ? (
                <div>
                  <textarea
                    className="upabc-ic-card-textarea"
                    value={this.state.comment}
                    onChange={(e) => {
                      this.setState({ comment: e.target.value });
                    }}
                  />
                  <div className="upabc-ic-card-edit-confirm-wrapper">
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
                this.props.pose.comments[this.props.commentIndex].comment
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({
  style: store.StyleReducer,
  pose: store.PoseAnalysisReducer.currentPose,
  user: store.PoseAnalysisReducer.currentPose.user,
}))(Router);

export const UserPoseAnalysisCommentCardComponent = Redux;
