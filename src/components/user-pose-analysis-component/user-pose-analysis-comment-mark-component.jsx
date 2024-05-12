import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "./user-pose-analysis-component.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indicatorMax: 20,
      indicatorValue: 20,
    };
  }

  locateMark(index, markPoint) {
    const sliderLength = 1123.64;
    const paddingDistance = 30;
    const adjustDistance = 18;
    const position =
      paddingDistance +
      ((Math.floor(this.props.pose.comments[index].time) * 1.007) /
        Math.floor(this.props.duration * 1000)) *
        sliderLength;

    // 0:location mark, 1:error indicator
    return markPoint == 0
      ? (position / (sliderLength + 100)) * 100 + "%"
      : ((position + adjustDistance) * 100) / (sliderLength + 100) + "%";
  }

  render() {
    return (
      <React.Fragment>
        <div
          className="upabc-icon-comment-mark"
          style={{
            left: this.locateMark(this.props.commentIndex, 0),
          }}
          onClick={() => {
            this.props.clickHandler(this.props.commentIndex);
          }}
        >
          <img src={process.env.PUBLIC_URL + "/img/icon_location_mark.svg"} />{" "}
          <div
            className="upabc-icon-part-photo"
            style={{
              backgroundImage: `url(${
                this.props.pose.comments[this.props.commentIndex].user.photoFile
                  ? process.env.PUBLIC_URL +
                    "/api/files/profile-photos/" +
                    this.props.pose.comments[this.props.commentIndex].user
                      .photoFile
                  : process.env.PUBLIC_URL + "/img/user_example.png"
              })`,
            }}
          ></div>
        </div>
        <div>
          <Slider
            // category: bad, good(active)
            className={
              this.props.pose.comments[this.props.commentIndex].category ==
              "bad"
                ? "upabc-indicator"
                : "upabc-indicator active"
            }
            style={{ left: this.locateMark(this.props.commentIndex, 1) }}
            min={0}
            max={this.state.indicatorMax}
            value={this.state.indicatorValue}
          />
        </div>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({
  pose: store.PoseAnalysisReducer.currentPose,
}))(Router);

export const UserPoseAnalysisCommentMarkComponent = Redux;
