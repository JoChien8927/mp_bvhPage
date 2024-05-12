import React from "react";
import { connect } from "react-redux";
import { WorkspaceMenuActions } from "../../../../redux/workspace-menu/workspace-menu-action";
import { Switch } from "antd";
import { ReactSVG } from "react-svg";
import { ActionRecordingActions } from "../../../../redux/action-recording/action-recording-action";

import { Actions } from "../../../../redux/action-recording/action";
import { currentActionRecording$ } from "../../../../redux/action-recording/action-recording-action";

class Component extends React.Component {
  constructor(props) {
    super(props);

    currentActionRecording$.subscribe((data) => {
      switch (data.action) {
        case Actions.menu.mode.changed:
          this.updateSceneMode(data.options.mode);
          break;
      }
    });
  }

  updateSceneMode(sceneMode) {
    this.props.dispatch(
      WorkspaceMenuActions.WorkspaceUpdateSceneMode(sceneMode),
    );

    ActionRecordingActions.StoreMenuModeChanged(sceneMode);
  }

  render() {
    return (
      <React.Fragment>
        <div className="sub-menu-wrapper">
          <div className="sub-menu-title">Scene Mode:</div>
          <div className="sub-menu-section active">
            <div
              className={`sub-menu-section-header ${
                this.props.mode.sceneMode == 1 ? "active active-alone" : ""
              }`}
            >
              <ReactSVG className="sub-menu-icon" src="/img/icon_mode.svg" />
              <span className="sub-menu-title">Splitted</span>
              <Switch
                checked={this.props.mode.sceneMode == 1}
                onChange={(val) => this.updateSceneMode(val ? 1 : 0)}
              />
            </div>
          </div>
          <div className="sub-menu-section active">
            <div
              className={`sub-menu-section-header ${
                this.props.mode.sceneMode == 0 ? "active active-alone" : ""
              }`}
            >
              <ReactSVG className="sub-menu-icon" src="/img/icon_body.svg" />
              <span className="sub-menu-title">Overlapped</span>
              <Switch
                checked={this.props.mode.sceneMode == 0}
                onChange={(val) => this.updateSceneMode(val ? 0 : 1)}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  mode: store.WorkspaceMenuReducer.mode,
  actionRecording: store.ActionRecordingReducer,
}))(Component);

export const PoseVisualizationRighMenuMode = Redux;
