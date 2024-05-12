import React from "react";
import { connect } from "react-redux";
import "./pose-selection-preview-component.scss";
import { withRouter } from "react-router-dom";
import { ReactSVG } from "react-svg";
import Grid from "@material-ui/core/Grid";
import { Modal, Button } from "antd";
import { VideoPreviewComponent } from "../../../components/video-preview-component/video-preview-component";
import { VideoPreviewHeaderComponent } from "../../../components/video-preview-header-component/video-preview-header-component";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  cancel() {
    this.props.history.push("/");
  }

  previewVideoClicked() {
    this.setState({
      previewPoseModal: true,
    });
  }

  clearState() {
    this.setState({
      previewPoseModal: false,
    });
  }

  render() {
    const dateOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return (
      <React.Fragment>
        <Modal
          centered={true}
          maskClosable={false}
          destroyOnClose={true}
          title="Pose Preview"
          open={this.state.previewPoseModal}
          onOk={(event) => {
            this.clearState();
          }}
          onCancel={(event) => {
            this.clearState();
          }}
          footer={[
            <Button
              key="back"
              onClick={(event) => {
                this.clearState();
              }}
            >
              Close
            </Button>,
          ]}
        >
          <Grid container spacing={2}>
            <video
              width="100%"
              src={
                process.env.PUBLIC_URL +
                "/api/files/mediapipe-pose/pose_" +
                this.props.pose._id +
                ".mp4"
              }
              type="video/mp4"
              controls
              autoPlay
              muted
            ></video>
          </Grid>
        </Modal>
        <div
          className={`preview-${this.props.position} preview-${this.props.amount} preview`}
        >
          <div className="preview-header">
            {this.props.pose.isMain ? "Reference Video" : "Comparing Video"}
          </div>
          <div
            className="preview-body"
            style={{
              height: this.props.style.posesSelectionPreviewBodyVH,
              maxHeight: this.props.style.posesSelectionPreviewBodyMaxVH,
            }}
          >
            {(() => {
              if (this.props.pose._id) {
                return (
                  <div>
                    <VideoPreviewHeaderComponent
                      showOptions={false}
                      pose={this.props.pose}
                      paddingTop="15px"
                      paddingBottom="15px"
                      size="lg"
                    />
                    <div className="pose-preview">
                      <VideoPreviewComponent
                        height={
                          this.props.style.posesSelectionPreviewBodyImageVH
                        }
                        playInScreen={true}
                        maxHeight={
                          this.props.style.posesSelectionPreviewBodyMaxImageVH
                        }
                        pose={this.props.pose}
                      />
                    </div>
                    <div className="preview-pose-info">
                      <div className="title">{this.props.pose.description}</div>
                      <div className="tags">{this.props.pose.skillType}</div>
                      <div className="duration">{this.props.pose.duration}</div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="no-pose-selected">
                    Select the first comparing pose video on the left list
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);
const Redux = connect((store) => ({
  style: store.StyleReducer,
}))(Router);

export const PoseSelectionPreviewPose = Redux;
