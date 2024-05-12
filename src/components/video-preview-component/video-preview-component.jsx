import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Avatar, Badge, Dropdown, Menu, Modal, Button, Spin } from "antd";
import "./video-preview-component.scss";
import { LoadingOutlined } from "@ant-design/icons";
import Grid from "@material-ui/core/Grid";
import { ReactSVG } from "react-svg";
import { VideoPreviewHeaderComponent } from "../video-preview-header-component/video-preview-header-component";

const antIcon = <LoadingOutlined style={{ fontSize: 35 }} spin />;

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processedVideoUrl:
        process.env.PUBLIC_URL +
        "/api/files/mediapipe-pose/" +
        this.props.pose._id +
        "/processed.mp4",
      originalVideoUrl:
        process.env.PUBLIC_URL +
        "/api/files/mediapipe-pose/pose_" +
        this.props.pose._id +
        ".mp4",
      imageUrl:
        process.env.PUBLIC_URL +
        "/api/files/mediapipe-pose/" +
        this.props.pose._id +
        "/image-00001.jpeg",
    };
  }

  previewVideoClicked() {
    this.setState({
      playingVideoInModal: !this.props.playInScreen,
      playingVideoInScreen: this.props.playInScreen,
    });
  }

  clearState() {
    this.setState({
      playingVideoInModal: false,
      playingVideoInScreen: false,
    });
  }

  render() {
    return (
      <React.Fragment>
        <Modal
          wrapClassName="video-preview-modal-wrapper"
          centered={true}
          maskClosable={false}
          destroyOnClose={true}
          title={[
            <VideoPreviewHeaderComponent
              showOptions={false}
              size="sm"
              pose={this.props.pose}
            />,
          ]}
          open={this.state.playingVideoInModal}
          onOk={(event) => {
            this.clearState();
          }}
          onCancel={(event) => {
            this.clearState();
          }}
          footer={[
            <div className="preview-options">
              <div className="pose-info">
                <div className="pose-name">{this.props.pose.description}</div>
                <div className="pose-tags">{this.props.pose.skillType}</div>
                <div className="duration">{this.props.pose.duration}</div>
              </div>
              <div className="button-options">
                <div
                  className="custom-button light"
                  key="back"
                  onClick={(event) => {
                    this.clearState();
                  }}
                >
                  Close
                </div>
                <div
                  className="ml-2 custom-button primary"
                  onClick={() => {
                    this.props.callback();
                    this.clearState();
                  }}
                >
                  {this.props.callbackName}
                </div>
              </div>
            </div>,
          ]}
        >
          <Grid container spacing={2}>
            <video
              width="100%"
              src={this.state.processedVideoUrl}
              type="video/mp4"
              controls
              autoPlay
              muted
            ></video>
          </Grid>
        </Modal>
        <div
          className={"video-preview-wrapper " + this.props.size ?? ""}
          style={{ height: this.props.height, maxHeight: this.props.maxHeight }}
        >
          {(() => {
            if (
              !this.props.pose.processCompleted &&
              !this.state.playingVideoInScreen
            ) {
              return (
                <Spin
                  indicator={antIcon}
                  tip={
                    this.props.pose.videoUploaded
                      ? "Processing..."
                      : "Uploading..."
                  }
                />
              );
            } else if (
              this.props.pose.sourceType === "mp4" &&
              !this.state.playingVideoInScreen
            ) {
              return (
                <div
                  className="pose-preview-image"
                  style={{
                    backgroundImage: `url(${this.state.imageUrl})`,
                  }}
                  onClick={(event) => {
                    this.previewVideoClicked();
                  }}
                >
                  <div className="pose-preview-image-hover">
                    <ReactSVG
                      className="play-icon"
                      src="/img/icon_video_play.svg"
                    />
                  </div>
                </div>
              );
            } else return <div></div>;
          })()}
          {(() => {
            if (this.state.playingVideoInScreen) {
              return (
                <video
                  width="100%"
                  height="100%"
                  src={this.state.processedVideoUrl}
                  type="video/mp4"
                  controls
                  autoPlay
                  muted
                ></video>
              );
            } else return <div></div>;
          })()}
        </div>
      </React.Fragment>
    );
  }
}

export const VideoPreviewComponent = Component;
