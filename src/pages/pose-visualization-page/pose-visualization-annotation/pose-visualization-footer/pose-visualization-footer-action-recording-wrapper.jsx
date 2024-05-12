import React from "react";
import { generateUUID } from "three/src/math/MathUtils";
import { connect } from "react-redux";
import { ActionRecordingActions } from "../../../../redux/action-recording/action-recording-action";
import { PoseVisualizationSaveRecording } from "./pose-visualization-footer-save-recording";
import { PoseVisualizationDeleteRecording } from "./pose-visualization-footer-delete-recording";
import { PoseVisualizationThumbnailImage } from "./pose-visualization-footer-thumbnail-image";
import { PoseVisualizationCommentView } from "./pose-visualization-footer-comment-view";
import { PoseVisualizationVoiceNoteView } from "./pose-visualization-footer-voice-note-view";
import { PoseVisualizationVoiceNoteAdd } from "./pose-visualization-footer-voice-note-add";
import { PoseVisualizationCommentAdd } from "./pose-visualization-footer-comment-add";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recordingLength: {
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
    };

    ActionRecordingActions.Init();
  }

  clearIntervals() {
    clearInterval(this.interval);
    clearInterval(this.cameraInterval);
    clearInterval(this.thumbnailInterval);
  }

  initRecordingIntervalOneFPS() {
    this.clearIntervals();
    this.interval = setInterval(this.validateRecordingTime.bind(this), 1000);
    this.cameraInterval = setInterval(this.storeCamera.bind(this), 1000 / 30);
    this.thumbnailInterval = setInterval(this.storeThumbnail.bind(this), 10000);
  }

  storeThumbnail() {
    const imgBase64 = this.props.getScreenshot();
    const file = this.dataURIToBlob(imgBase64);
    ActionRecordingActions.StoreThumbnailStart(file);
  }

  dataURIToBlob(dataURI) {
    const splitDataURI = dataURI.split(",");
    const byteString =
      splitDataURI[0].indexOf("base64") >= 0
        ? atob(splitDataURI[1])
        : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(":")[1].split(";")[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);

    return new Blob([ia], { type: mimeString });
  }

  storeCamera() {
    const cameraPosition = this.props.getCameraPosition();
    ActionRecordingActions.StoreCameraPosition(
      cameraPosition.position,
      cameraPosition.rotation,
    );
  }

  validateRecordingTime() {
    if (this.props.actionRecording.recordingState) {
      let seconds = this.props.actionRecording.previousRecordingLength;

      if (this.props.actionRecording.recordingState == 1) {
        const miliseconds =
          Date.now() - this.props.actionRecording.currentRecordingStartedAt;
        seconds += Math.floor(miliseconds / 1000);
      }

      let minutes = Math.floor(seconds / 60);
      seconds %= 60;
      let hours = Math.floor(minutes / 60);
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

  pauseRecording() {
    ActionRecordingActions.PauseRecording();
    this.clearIntervals();
    this.validateRecordingTime();
  }

  startRecording() {
    ActionRecordingActions.NewRecordingStart(
      this.props.currentAnalysis._id,
      this.props.camera.position,
      this.props.camera.rotation,
      this.storeThumbnail.bind(this),
    );
    this.initRecordingIntervalOneFPS();
  }

  saveVideo() {}

  deleteVideo() {}

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

  play() {
    this.initPlayInterval();
  }

  initPlayInterval() {
    clearInterval(this.playInterval);
    clearInterval(this.getDataInterval);

    this.obtainRecordingActions();
    var bind = this;

    this.getDataInterval = setInterval(bind.obtainRecordingActions, 2000);

    setTimeout(function () {
      bind.playInterval = setInterval(bind.playFrame, 1000 / 30);
    }, 500);
  }

  playFrame() {
    if (
      this.props.actionRecording.currentFrame >
      this.props.actionRecording.recordingsFramesEnd
    ) {
      if (
        this.props.actionRecording.recordings.length ==
        this.props.actionRecording.totalRecordings
      )
        clearInterval(this.playInterval);
      else return;
    }

    ActionRecordingActions.PlayActionFrame();
  }

  obtainRecordingActions() {
    if (
      this.props.actionRecording.totalRecordings > 0 &&
      this.props.actionRecording.recordings.length ==
        this.props.actionRecording.totalRecordings
    ) {
      clearInterval(this.getDataInterval);
    }

    ActionRecordingActions.ObtainActionRecordingsStart(
      this.props.actionRecording.recordingsFramesEnd + 1,
      this.props.actionRecording.recordingsFramesEnd + 30 * 5,
    );
  }

  getThumbnails() {
    const thumnails = new Array();

    this.props.actionRecording.thumbnails.map((item) => {
      switch (item.type) {
        case "image":
          const file = `/api${item.file}`;
          thumnails.push(
            <PoseVisualizationThumbnailImage
              key={generateUUID()}
              fileLocation={file}
            />,
          );
          break;
        case "comment":
          thumnails.push(
            <PoseVisualizationCommentView
              key={generateUUID()}
              comment={item}
            />,
          );
          break;
        case "voiceNote":
          thumnails.push(
            <PoseVisualizationVoiceNoteView
              key={generateUUID()}
              comment={item}
            />,
          );
          break;
      }
    });

    return (
      <div className="thumbnails" key={generateUUID()}>
        {thumnails}
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        <div
          className={`footer${
            this.props.actionRecording.show ? " active" : ""
          }`}
        >
          <a
            onClick={() => {
              if (this.props.actionRecording.recordingState == 1) {
                this.pauseRecording();
              } else {
                this.startRecording();
              }
            }}
          >
            {(() => {
              if (this.props.actionRecording.recordingState == 1) {
                return (
                  <img
                    className="recording-button"
                    src={process.env.PUBLIC_URL + "/img/pause_recording.svg"}
                  />
                );
              } else {
                return (
                  <img
                    className="recording-button"
                    src={process.env.PUBLIC_URL + "/img/start_recording.svg"}
                  />
                );
              }
            })()}
          </a>
          <div>{this.getTime()}</div>
          {this.getThumbnails()}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              paddingRight: "20px",
            }}
          >
            <PoseVisualizationVoiceNoteAdd
              active={this.props.actionRecording.recordingState == 1}
            />
            <PoseVisualizationCommentAdd
              active={this.props.actionRecording.recordingState != 0}
              recordingState={this.props.actionRecording.recordingState}
              startRecording={this.startRecording.bind(this)}
              pauseRecording={this.pauseRecording.bind(this)}
            />
            <PoseVisualizationSaveRecording
              active={this.props.actionRecording.recordingState != 0}
              saveVideo={this.saveVideo.bind(this)}
            />
            <PoseVisualizationDeleteRecording
              active={this.props.actionRecording.recordingState != 0}
              saveVideo={this.saveVideo.bind(this)}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  currentAnalysis: store.TrainingAnalysisReducer.currentAnalysis,
  actionRecording: store.ActionRecordingReducer,
}))(Component);

export const PoseVisualizationFooterActionRecordingWrapper = Redux;
