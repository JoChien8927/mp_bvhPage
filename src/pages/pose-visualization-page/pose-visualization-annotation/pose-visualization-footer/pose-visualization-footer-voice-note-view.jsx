import React from "react";
import { connect } from "react-redux";
import { ReactSVG } from "react-svg";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileLocation: props.fileLocation,
    };
  }

  render() {
    return (
      <React.Fragment>
        <div className="voiceNoteWrapper">
          <div className="marker"></div>
          <ReactSVG className="voiceNote" src="/img/icon_audio.svg" />
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({}))(Component);

export const PoseVisualizationVoiceNoteView = Redux;
