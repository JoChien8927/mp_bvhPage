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
            this.props.deleteVideo();
          }}
        >
          <Tooltip title="Delete" placement="top">
            <ReactSVG src="/img/icon_delete.svg" />
          </Tooltip>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({}))(Component);

export const PoseVisualizationDeleteRecording = Redux;
