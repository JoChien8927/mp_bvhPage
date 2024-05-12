import React from "react";
import { connect } from "react-redux";
import { WorkspaceMenuActions } from "../../../../redux/workspace-menu/workspace-menu-action";
import { RecordingActions } from "../../../../redux/recordings/recording-action";
import { ActionRecordingActions } from "../../../../redux/action-recording/action-recording-action";
import { Tooltip } from "antd";
import { ReactSVG } from "react-svg";
import { PoseVisualizationRighMenuMode } from "./pose-visualization-right-menu-mode";
import { PoseVisualizationRighMenuDraw } from "./pose-visualization-right-menu-draw";
import { PoseVisualizationRighMenuTrajectory } from "./pose-visualization-right-menu-trajectory";
import { PoseVisualizationRighMenuAngles } from "./pose-visualization-right-menu-angles";
import { PoseVisualizationRighMenuLaser } from "./pose-visualization-right-menu-laser";

import { currentActionRecording$ } from "../../../../redux/action-recording/action-recording-action";
import { Actions } from "../../../../redux/action-recording/action";

class Component extends React.Component {
  constructor(props) {
    super(props);

    currentActionRecording$.subscribe((data) => {
      if (data.action == Actions.menu.general.open_collapse) {
        this.collapseExpandMenu(data.options.optionSelected);
      }
    });
  }

  dispatchCollapseExpandMenu(subMenuOption) {
    this.props.dispatch(
      WorkspaceMenuActions.WorkspaceCollapseExpandMenu(subMenuOption),
    );
  }

  dispatchRecordingShowHideOptions() {
    this.props.dispatch(RecordingActions.recordingShowHideOptions());
    this.props.dispatch(ActionRecordingActions.ShowHideOptions());
  }

  collapseExpandMenu(subMenuOption) {
    switch (subMenuOption) {
      case this.props.menuOptions.mode:
      case this.props.menuOptions.draw:
      case this.props.menuOptions.trajectory:
      case this.props.menuOptions.angles:
      case this.props.menuOptions.zoom:
      case this.props.menuOptions.laser:
        this.dispatchCollapseExpandMenu(subMenuOption);
        ActionRecordingActions.StoreMenuOpenCloseAction(subMenuOption);
        break;
      case this.props.menuOptions.recordings:
        this.dispatchRecordingShowHideOptions();
        ActionRecordingActions.StoreMenuOpenCloseAction(subMenuOption);
        break;
      default:
        break;
    }
  }

  getMenuOptionClass(subMenuOption) {
    let className = "menu-icon";

    switch (subMenuOption) {
      case this.props.menuOptions.draw:
        className += this.props.drawOptions.show ? " active" : "";
        break;
      case this.props.menuOptions.trajectory:
        className += this.props.trajectoryOptions.show ? " active" : "";
        break;
      case this.props.menuOptions.angles:
        className += this.props.angleOptions.show ? " active" : "";
        break;
      case this.props.menuOptions.laser:
        className += this.props.laserOptions.show ? " active" : "";
        break;
      case this.props.menuOptions.recordings:
        className += this.props.actionRecording.show ? " active" : "";
        break;

      default:
        break;
    }

    if (this.props.subMenuOpen && subMenuOption === this.props.subMenuOption) {
      className += " open";
    }

    return className;
  }

  getSubMenu() {
    switch (this.props.subMenuOption) {
      case this.props.menuOptions.mode:
        return <PoseVisualizationRighMenuMode></PoseVisualizationRighMenuMode>;
      case this.props.menuOptions.draw:
        return <PoseVisualizationRighMenuDraw></PoseVisualizationRighMenuDraw>;
      case this.props.menuOptions.trajectory:
        return (
          <PoseVisualizationRighMenuTrajectory></PoseVisualizationRighMenuTrajectory>
        );
      case this.props.menuOptions.angles:
        return (
          <PoseVisualizationRighMenuAngles></PoseVisualizationRighMenuAngles>
        );
      case this.props.menuOptions.laser:
        return (
          <PoseVisualizationRighMenuLaser></PoseVisualizationRighMenuLaser>
        );
      default:
        break;
    }
  }

  render() {
    return (
      <div className="right-menu-wrapper">
        <div className="right-menu-icons-wrapper">
          <div className="righ-menu-icons">
            <Tooltip
              title="Open/Close"
              placement="right"
              onClick={() => this.collapseExpandMenu(this.props.subMenuOption)}
            >
              <ReactSVG
                className={"menu-icon hamburger"}
                src="/img/collapse.svg"
              />
            </Tooltip>
            <div className="right-menu-icons-list">
              <Tooltip
                title="Mode"
                placement="right"
                className={this.getMenuOptionClass(this.props.menuOptions.mode)}
                onClick={() =>
                  this.collapseExpandMenu(this.props.menuOptions.mode)
                }
              >
                <ReactSVG src="/img/icon_mode.svg" />
              </Tooltip>
              <Tooltip
                title="Draw"
                placement="right"
                className={this.getMenuOptionClass(this.props.menuOptions.draw)}
                onClick={() =>
                  this.collapseExpandMenu(this.props.menuOptions.draw)
                }
              >
                <ReactSVG src="/img/icon_draw.svg" />
              </Tooltip>
              <Tooltip
                title="Trajectory"
                placement="right"
                className={this.getMenuOptionClass(
                  this.props.menuOptions.trajectory,
                )}
                onClick={() =>
                  this.collapseExpandMenu(this.props.menuOptions.trajectory)
                }
              >
                <ReactSVG src="/img/icon_trajectory.svg" />
              </Tooltip>
              <Tooltip
                title="Ruler"
                placement="right"
                className={this.getMenuOptionClass(
                  this.props.menuOptions.angles,
                )}
                onClick={() =>
                  this.collapseExpandMenu(this.props.menuOptions.angles)
                }
              >
                <ReactSVG src="/img/icon_ruler.svg" />
              </Tooltip>
              <Tooltip
                title="Laser pointer"
                placement="right"
                className={this.getMenuOptionClass(
                  this.props.menuOptions.laser,
                )}
                onClick={() =>
                  this.collapseExpandMenu(this.props.menuOptions.laser)
                }
              >
                <ReactSVG src="/img/icon_pointer.svg" />
              </Tooltip>
              <Tooltip
                title="Recordings"
                placement="right"
                className={this.getMenuOptionClass(
                  this.props.menuOptions.recordings,
                )}
                onClick={() =>
                  this.collapseExpandMenu(this.props.menuOptions.recordings)
                }
              >
                <ReactSVG src="/img/icon_recording.svg" />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="right-menu-sub">
          <div
            className={`right-menu-sub-external-wrapper ${
              this.props.subMenuOpen ? "active" : ""
            }`}
          >
            {this.getSubMenu()}
          </div>
        </div>
      </div>
    );
  }
}

const Redux = connect((store) => ({
  menuOptions: store.WorkspaceMenuReducer.menuOptions,
  subMenuOption: store.WorkspaceMenuReducer.subMenuOption,
  subMenuOpen: store.WorkspaceMenuReducer.subMenuOpen,
  drawOptions: store.WorkspaceMenuReducer.drawOptions,
  trajectoryOptions: store.WorkspaceMenuReducer.trajectoryOptions,
  angleOptions: store.WorkspaceMenuReducer.angleOptions,
  laserOptions: store.WorkspaceMenuReducer.laserOptions,
  actionRecording: store.ActionRecordingReducer,
}))(Component);

export const PoseVisualizationRighMenuWrapper = Redux;
