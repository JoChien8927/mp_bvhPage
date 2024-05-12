import React from "react";
import { connect } from "react-redux";
import { ReactMediaRecorder } from "react-media-recorder";
import { generateUUID } from "three/src/math/MathUtils";
import { ReactSVG } from "react-svg";
import { Tooltip, Spin } from "antd";
import { TrainingPoseAction } from "../../../../../redux/training-poses/training-poses-action";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recordingState: 0,
      recordingLength: {
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      currentPose: this.props.currentAnalysis.poses[0],
    };
  }

  componentDidMount() {
    this.getSavedRecordingLength();
    this.validateRecordingTime = this.validateRecordingTime.bind(this);
    this.initRecordingIntervalOneFPS();
  }

  initRecordingIntervalOneFPS() {
    this.interval = setInterval(this.validateRecordingTime, 1000);
  }

  getSavedRecordingLength() {
    if (!this.props.currentAnalysis?.inProgressRecordings) {
      this.setState({
        recordingLength: {
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
      });
      return;
    }

    let length = Math.ceil(
      this.props.currentAnalysis.inProgressRecordings
        .filter((x) => x.type == "video")
        .reduce((previus, current) => {
          return previus + current.duration;
        }, 0),
    );

    let hours = Math.floor(length / 3600);
    length %= 3600;
    let minutes = Math.floor(length / 60);
    length %= 60;
    let seconds = length;

    this.setState({
      recordingLength: {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
      },
    });
  }

  validateRecordingTime() {
    if (this.state.recordingState == 1) {
      let seconds = this.state.recordingLength.seconds + 1;
      let minutes = Math.floor(
        this.state.recordingLength.minutes + seconds / 60,
      );
      seconds %= 60;
      let hours = Math.floor(this.state.recordingLength.hours + minutes / 60);
      minutes %= 60;

      this.setState({
        recordingLength: {
          hours: hours,
          minutes: minutes,
          seconds: seconds,
        },
      });
    }
  }

  processVideo(blob) {
    this.props.dispatch(
      TrainingPoseAction.TrainingPoseProcessRecordingStart(
        this.props.currentAnalysis?._id,
        blob,
      ),
    );

    this.stopRecording();
  }

  stopRecording() {
    this.setState({
      recordingState: 0,
    });
  }

  startRecording() {
    this.setState({
      recordingState: 1,
    });
  }

  saveVideo() {
    if (
      !this.props.currentAnalysis?.inProgressRecordings ||
      this.props.currentAnalysis?.inProgressRecordings.length == 0
    ) {
      this.props.dispatch(
        AlertAction.alertStart("Error", "No recordings pending to be saved"),
      );
      return;
    }

    this.props.dispatch(
      TrainingPoseAction.TrainingPoseSaveRecordingStart(
        this.props.currentAnalysis?._id,
      ),
    );
  }

  getThumbnails() {
    const images = new Array();

    if (!this.props.currentAnalysis?.inProgressRecordings) {
      return (
        <div
          style={{
            display: "flex",
            paddingRight: 10,
            paddingLeft: 10,
          }}
          key={generateUUID()}
        >
          {images}
        </div>
      );
    }

    this.props.currentAnalysis?.inProgressRecordings.map((item) => {
      let durationPending = item.duration;
      if (item.type == "video") {
        for (let index = 1; index <= item.thumnailsAmount; index++) {
          const thumbnailSize =
            durationPending > 15 ? 50 : (50 * durationPending) / 15.0;
          const fileName =
            item.thumnailsAmount > 1
              ? "tn_" + index.toString() + ".png"
              : "tn.png";
          durationPending -= 15;

          images.push(
            <div
              className="thumbnailWrapper"
              key={generateUUID()}
              style={{ width: thumbnailSize }}
            >
              <div
                className="thumbnailHovered"
                key={generateUUID()}
                style={{
                  background:
                    "url('" +
                    "/api/files/recordings" +
                    item.thumnailsFolder +
                    fileName +
                    "')",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                }}
                alt=""
              ></div>
              <div
                className="thumbnail"
                key={generateUUID()}
                style={{
                  background:
                    "url('" +
                    "/api/files/recordings" +
                    item.thumnailsFolder +
                    fileName +
                    "')",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                }}
                alt=""
              ></div>
            </div>,
          );
        }
      }
    });

    return (
      <div
        style={{
          display: "flex",
          paddingRight: 10,
          paddingLeft: 10,
        }}
        key={generateUUID()}
      >
        {images}
      </div>
    );
  }

  pad(num, size) {
    let s = num.toString();
    while (s.length < size) {
      s = "0" + s;
    }
    return s;
  }

  getTime() {
    return [
      this.pad(this.state.recordingLength.hours, 2),
      this.pad(this.state.recordingLength.minutes, 2),
      this.pad(this.state.recordingLength.seconds, 2),
    ].join(":");
  }

  render() {
    return (
      <React.Fragment>
        <div className={"footer active"} style={{ padding: "10px 0px" }}>
          <ReactMediaRecorder
            audio={true}
            screen={true}
            blobPropertyBag={{ type: "video/mp4" }}
            onStop={(blobUrl, blob) => {
              this.processVideo(blob);
            }}
            onStart={() => {
              this.startRecording();
            }}
            error={(err) => {
              console.log("err", err);
              this.stopRecording();
            }}
            render={({
              status,
              startRecording,
              stopRecording,
              mediaBlobUrl,
            }) => (
              <div
                style={{
                  display: "flex",
                  height: "63px",
                  alignItems: "center",
                }}
              >
                {/* <p>{status}</p> */}
                <a
                  style={{ marginLeft: "20px", fontSize: "30px", color: "red" }}
                  onClick={() => {
                    if (this.state.recordingState == 0) {
                      startRecording();
                    } else if (this.state.recordingState == 1) {
                      stopRecording();
                    }
                  }}
                >
                  {(() => {
                    if (this.state.recordingState == 1) {
                      return (
                        <img
                          src={
                            process.env.PUBLIC_URL + "/img/pause_recording.svg"
                          }
                          style={{ height: "50px", paddingLeft: 20 }}
                        />
                      );
                    } else {
                      return (
                        <img
                          src={
                            process.env.PUBLIC_URL + "/img/start_recording.svg"
                          }
                          style={{ height: "50px", paddingLeft: 20 }}
                        />
                      );
                    }
                  })()}
                </a>

                {/* <video style={{width: "100vw"}}src={mediaBlobUrl} controls autoPlay loop /> */}
                <div style={{ paddingLeft: 20 }}>{this.getTime()}</div>
                <div
                  id="thumbnails"
                  style={{
                    display: "flex",
                    // overflowX: "scroll",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {this.getThumbnails()}
                </div>
                {(() => {
                  if (this.props.processingRecording) {
                    return <Spin tip="Processing..."></Spin>;
                  }
                })()}
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    paddingRight: "20px",
                  }}
                >
                  {(() => {
                    if (this.state.recordingState === 0) {
                      return (
                        <div
                          className="recording-action"
                          onClick={() => {
                            this.saveVideo();
                          }}
                        >
                          <Tooltip title="Save" placement="top">
                            <ReactSVG src="/img/icon_save_change.svg" />
                          </Tooltip>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
          />
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  currentAnalysis: store.TrainingAnalysisReducer.currentAnalysis,
  processingRecording: store.TrainingPoseReducer.processingRecording,
}))(Component);

export const PoseVisualizationFooterWrapper = Redux;
