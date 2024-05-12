import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { ReactSVG } from "react-svg";
import { Dropdown, Menu } from "antd";
import { UserPoseAnalysisCommentCardComponent } from "./user-pose-analysis-comment-card-component";
import { UserPoseAnalysisCommentMarkComponent } from "./user-pose-analysis-comment-mark-component";
import "./user-pose-analysis-component.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leftSideSelection: "Original Video",
      processedVideoUrl:
        process.env.PUBLIC_URL +
        "/api/files/mediapipe-pose/" +
        this.props.pose._id +
        "/processed.mp4",
      playbackIsPlay: false,
      playbackIsLoop: false,
      playbackSpeed: 1,
      sliderMax: Math.floor(this.props.pose.duration * 1000),
      playerCurrentTime: 0,
      previousIndex: -1,
      commentRefs: this.props.pose.comments.map((comment, index) => {
        return React.createRef();
      }),
    };

    // this.playerCurrentTime = 0;
  }

  videoRef = (videoPlayer) => {
    this.vPlayer = videoPlayer;
  };

  videoPlayPauseControl() {
    // play / pause
    !this.state.playbackIsPlay ? this.vPlayer.play() : this.vPlayer.pause();

    // playback rate(speed)
    this.vPlayer.playbackRate = this.state.playbackSpeed;

    this.setState({
      playbackIsPlay: !this.state.playbackIsPlay,
    });
  }

  durationFormat(duration) {
    const second = Math.floor(duration % 60);
    const minute = Math.floor((duration / 60) % 60);
    const hour = Math.floor(duration / 3600);

    if (minute < 10 && second < 10) {
      return hour + ":0" + minute + ":0" + second;
    } else if (minute < 10) {
      return hour + ":0" + minute + ":" + second;
    } else if (second < 10) {
      return hour + ":" + minute + ":0" + second;
    } else {
      return hour + ":" + minute + ":" + second;
    }
  }

  updatePosFromSlider(value) {
    this.vPlayer.currentTime = value / 1000;

    // this.playerCurrentTime = value;
    this.setState({
      playerCurrentTime: value,
    });
  }

  commentClickHandler(index) {
    // connect timeline bar position
    this.updatePosFromSlider(this.props.pose.comments[index].time);

    // set comment card activate
    this.setState({ previousIndex: index });

    // auto scroll to focus
    this.state.commentRefs[index].current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  componentDidMount() {
    // duration and timeline
    this.vPlayer.addEventListener("timeupdate", () => {
      const playerCurrentTime = Math.floor(this.vPlayer.currentTime * 1000);

      this.setState({
        playerCurrentTime: playerCurrentTime,
      });
    });

    // switch icon when video ends
    this.vPlayer.addEventListener("pause", () => {
      this.setState({
        playbackIsPlay: false,
      });
    });
  }

  render() {
    const speedOptions = (
      <Menu>
        <Menu.Item
          key="2"
          onClick={() => {
            this.setState({ playbackSpeed: 2 });
          }}
        >
          2.0
        </Menu.Item>
        <Menu.Item
          key="1"
          onClick={() => {
            this.setState({ playbackSpeed: 1 });
          }}
        >
          1.0
        </Menu.Item>
        <Menu.Item
          key="0.5"
          onClick={() => {
            this.setState({ playbackSpeed: 0.5 });
          }}
        >
          0.5
        </Menu.Item>
        <Menu.Item
          key="0.25"
          onClick={() => {
            this.setState({ playbackSpeed: 0.25 });
          }}
        >
          0.25
        </Menu.Item>
      </Menu>
    );
    return (
      <React.Fragment>
        <div className="upabc-container">
          <div className="upabc-left-body-wrapper">
            <div className="upabc-left-option-wrapper">
              {(() => {
                if (this.state.leftSideSelection === "3D Skeleton") {
                  return (
                    <div
                      className="upabc-left-option-select active"
                      onClick={() => {
                        this.setState({ leftSideSelection: "3D Skeleton" });
                      }}
                    >
                      3D Skeleton
                    </div>
                  );
                } else {
                  return (
                    <div
                      className="upabc-left-option-select"
                      onClick={() => {
                        this.setState({ leftSideSelection: "3D Skeleton" });
                      }}
                    >
                      3D Skeleton
                    </div>
                  );
                }
              })()}
              {(() => {
                if (this.state.leftSideSelection === "Original Video") {
                  return (
                    <div
                      className="upabc-left-option-select active"
                      onClick={() => {
                        this.setState({ leftSideSelection: "Original Video" });
                      }}
                    >
                      Original Video
                    </div>
                  );
                } else {
                  return (
                    <div
                      className="upabc-left-option-select"
                      onClick={() => {
                        this.setState({ leftSideSelection: "Original Video" });
                      }}
                    >
                      Original Video
                    </div>
                  );
                }
              })()}
            </div>
            <div className="upabc-left-option-content-container">
              {this.state.leftSideSelection === "Original Video" ? (
                <>
                  <div className="upabc-video-content">
                    <video
                      src={this.state.processedVideoUrl}
                      type="video/mp4"
                      muted
                      loop={this.state.playbackIsLoop}
                      ref={(videoPlayer) => this.videoRef(videoPlayer)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="upabc-video-content">
                    here is 3D skeleton container
                    {/* <Workspace
                      poses={this.props.currentAnalysis.poses}
                      sessionSourceType="mediapipe"
                    /> */}
                  </div>
                </>
              )}
              <div className="upabc-video-playback-bar-wrapper">
                {this.props.pose.comments.map((comments, index) => {
                  return (
                    <UserPoseAnalysisCommentMarkComponent
                      key={index}
                      commentIndex={index}
                      clickHandler={this.commentClickHandler.bind(this)}
                      duration={this.props.pose.duration}
                    />
                  );
                })}
                <Slider
                  className="upabc-video-playback-bar"
                  allowCross={false}
                  min={0}
                  max={this.state.sliderMax}
                  defaultValue={this.state.playerCurrentTime}
                  value={this.state.playerCurrentTime}
                  onChange={(val) => this.updatePosFromSlider(val)}
                />
                {/* <Slider
                  className="upabc-video-playback-bar-handler"
                  allowCross={false}
                  min={0}
                  max={this.state.sliderMax}
                  defaultValue={this.state.playerCurrentTime}
                  value={this.state.playerCurrentTime}
                  onChange={(val) => this.updatePosFromSlider(val)}
                /> */}
              </div>
              <div className="upabc-video-control-wrapper">
                <ReactSVG
                  className="upabc-icon-play-pause"
                  src={
                    this.state.playbackIsPlay
                      ? "/img/icon_pause.svg"
                      : "/img/icon_play.svg"
                  }
                  onClick={() => {
                    this.videoPlayPauseControl();
                  }}
                />
                <div className="upabc-play-speed-wrapper">
                  <div className="upabc-play-speed">
                    <Dropdown
                      className="upabc-dropdown-speed"
                      trigger={"click"}
                      overlay={speedOptions}
                    >
                      <div>
                        X{" "}
                        {this.state.playbackSpeed >= 1
                          ? this.state.playbackSpeed.toString() + ".0"
                          : this.state.playbackSpeed}
                      </div>
                    </Dropdown>
                  </div>
                </div>
                <div className="upabc-video-duration">
                  <div className="upabc-video-current-time">
                    {this.durationFormat(this.state.playerCurrentTime / 1000)}
                  </div>
                  /<div>{this.durationFormat(this.props.pose.duration)}</div>
                </div>
                <ReactSVG
                  className={
                    this.state.playbackIsLoop
                      ? "upabc-icon-repeat active"
                      : "upabc-icon-repeat"
                  }
                  src="/img/icon_on_repeat.svg"
                  onClick={() => {
                    this.setState({
                      playbackIsLoop: !this.state.playbackIsLoop,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="upabc-right-body-wrapper">
            <div className="upabc-right-option-wrapper">
              <div
                className="upabc-right-option-select active"
                onClick={() => {
                  this.setState({
                    rightSideSelection: "Instruction Comments",
                  });
                }}
              >
                Instruction Comments
              </div>
            </div>
            <div className="upabc-right-option-content-container">
              {this.props.pose.comments.map((comments, index) => {
                return (
                  <div key={index} ref={this.state.commentRefs[index]}>
                    <UserPoseAnalysisCommentCardComponent
                      commentIndex={index}
                      previousIndex={this.state.previousIndex}
                      clickHandler={this.commentClickHandler.bind(this)}
                      durationFormat={this.durationFormat.bind(this)}
                    />
                  </div>
                );
              })}
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

export const UserPoseAnalysisBodyComponent = Redux;
