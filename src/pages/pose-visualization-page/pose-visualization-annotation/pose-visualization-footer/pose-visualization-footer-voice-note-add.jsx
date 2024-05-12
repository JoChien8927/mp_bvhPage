import React from "react";
import { connect } from "react-redux";
import { ReactSVG } from "react-svg";
import { Input, Tooltip } from "antd";
import { ReactMediaRecorder } from "react-media-recorder";
import { ActionRecordingActions } from "../../../../redux/action-recording/action-recording-action";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recordingState: 0,
    };
  }

  stopRecording(blob) {
    if (blob) {
      ActionRecordingActions.StoreVoiceNoteStart(blob);
    }

    this.setState({
      recordingState: 0,
    });
  }

  startRecording() {
    this.setState({
      recordingState: 1,
    });
  }

  render() {
    return (
      <React.Fragment>
        <ReactMediaRecorder
          audio={true}
          blobPropertyBag={{ type: "audio/wav" }}
          onStop={(blobUrl, blob) => {
            this.stopRecording(blob);
          }}
          onStart={() => {
            this.startRecording();
          }}
          error={(err) => {
            console.log("err", err);
            this.stopRecording(null);
          }}
          render={({ status, startRecording, stopRecording, mediaBlobUrl }) =>
            (() => {
              if (this.state.recordingState == 0) {
                return (
                  <div
                    className={`recording-action ${
                      this.props.active ? "enable" : ""
                    }`}
                    onClick={() => {
                      if (this.props.active) startRecording();
                    }}
                  >
                    <Tooltip title="Start Audio Recording" placement="top">
                      <ReactSVG src="/img/icon_audio_muted.svg" />
                    </Tooltip>
                  </div>
                );
              } else {
                return (
                  <div
                    className={`recording-action active ${
                      this.props.active ? "enable" : ""
                    }`}
                    onClick={stopRecording}
                  >
                    <Tooltip title="Stop Audio Recording" placement="top">
                      <ReactSVG src="/img/icon_audio.svg" />
                    </Tooltip>
                  </div>
                );
              }
            })()
          }
        />
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({}))(Component);

export const PoseVisualizationVoiceNoteAdd = Redux;
