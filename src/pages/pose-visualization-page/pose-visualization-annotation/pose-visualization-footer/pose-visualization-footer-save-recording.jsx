import React from "react";
import { connect } from "react-redux";
import { ReactSVG } from "react-svg";
import { Tooltip } from "antd";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <React.Fragment>
        <div
          className={`recording-action ${this.props.active ? "enable" : ""}`}
          onClick={() => {
            this.props.saveVideo();
          }}
        >
          <Tooltip title="Save" placement="top">
            <ReactSVG src="/img/icon_save_change.svg" />
          </Tooltip>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({}))(Component);

export const PoseVisualizationSaveRecording = Redux;
