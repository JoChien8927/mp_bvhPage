import React from "react";
import { connect } from "react-redux";
import { WorkspaceMenuActions } from "../../../../redux/workspace-menu/workspace-menu-action";
import { Switch, Slider, Checkbox } from "antd";
import { ReactSVG } from "react-svg";

import { ActionRecordingActions } from "../../../../redux/action-recording/action-recording-action";
import { Actions } from "../../../../redux/action-recording/action";
import { currentActionRecording$ } from "../../../../redux/action-recording/action-recording-action";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    currentActionRecording$.subscribe((data) => {
      switch (data.action) {
        case Actions.menu.trajectory.activate_inactivate:
          this.showHideTrajectory(data.options.show);
          break;
        case Actions.menu.trajectory.show_hide_limb:
          this.showHideBodySection(data.options.limb, data.options.show);
          break;
        case Actions.menu.trajectory.density:
          this.updateTrajectoryDensity(data.options.density);
          break;
        case Actions.menu.trajectory.length:
          this.updateTrajectoryLength(data.options.length);
          break;
      }
    });
  }

  updateTrajectoryOptions(trajectoryOptions) {
    this.props.dispatch(
      WorkspaceMenuActions.WorkspaceUpdateTrajectoryOptions(trajectoryOptions),
    );
  }

  showHideTrajectory(show) {
    this.updateTrajectoryOptions({
      ...this.props.trajectoryOptions,
      show: show,
    });

    ActionRecordingActions.StoreMenuTrajectoryActivateInactivate(show);
  }

  updateTrajectoryDensity(density) {
    this.updateTrajectoryOptions({
      ...this.props.trajectoryOptions,
      density: density,
    });

    ActionRecordingActions.StoreMenuTrajectoryDensity(density);
  }

  updateTrajectoryLength(length) {
    this.updateTrajectoryOptions({
      ...this.props.trajectoryOptions,
      length: length,
    });

    ActionRecordingActions.StoreMenuTrajectoryLength(length);
  }

  showHideBodySection(bodySection, val) {
    this.updateTrajectoryOptions({
      ...this.props.trajectoryOptions,
      [bodySection]: val,
    });

    ActionRecordingActions.StoreMenuTrajectoryShowHideLimb(bodySection, val);
  }

  render() {
    return (
      <React.Fragment>
        <div className="sub-menu-wrapper">
          <div className="sub-menu-title">Trajectories:</div>
          <div className="sub-menu-section active">
            <div
              className={
                "sub-menu-section-header" +
                (this.props.trajectoryOptions.show ? " active" : "")
              }
            >
              <ReactSVG className="sub-menu-icon" src="/img/icon_body.svg" />
              <span className="sub-menu-title">Body Trajectory</span>
              <Switch
                checked={this.props.trajectoryOptions.show}
                onChange={(val) =>
                  this.showHideTrajectory(!this.props.trajectoryOptions.show)
                }
              />
            </div>
            <div
              className={
                "sub-menu-section-body" +
                (this.props.trajectoryOptions.show ? " active" : "")
              }
            >
              {/* <div style={{ paddingTop: "5px", paddingLeft: "8px" }}>
                Trajectory Density
              </div>
              <Slider
                disabled={!this.props.trajectoryOptions.show}
                style={{ width: "calc(100% - 16px)", margin: "0px 8px" }}
                min={0}
                max={100}
                onChange={(val) => this.updateTrajectoryDensity(val)}
                value={this.props.trajectoryOptions.density}
              /> */}
              <div style={{ paddingTop: "8px", paddingLeft: "8px" }}>
                Trajectory Distance
              </div>
              <Slider
                disabled={!this.props.trajectoryOptions.show}
                style={{ width: "calc(100% - 16px)", margin: "0px 8px" }}
                min={0}
                max={100}
                onChange={(val) => this.updateTrajectoryLength(val)}
                value={this.props.trajectoryOptions.length}
              />
              {/* <div style={{ paddingTop: "8px", paddingLeft: "8px" }}>
                Which Trajectory to Show
              </div>
              <div style={{ display: "flex", paddingLeft: "8px" }}>
                <div style={{ width: "50%" }}>
                  <div>
                    <Checkbox
                      disabled={!this.props.trajectoryOptions.show}
                      checked={this.props.trajectoryOptions.head}
                      onChange={(val) =>
                        this.showHideBodySection("head", val.target.checked)
                      }
                    >
                      Head
                    </Checkbox>
                  </div>
                  <div>
                    <Checkbox
                      disabled={!this.props.trajectoryOptions.show}
                      checked={this.props.trajectoryOptions.rightShoulder}
                      onChange={(val) =>
                        this.showHideBodySection(
                          "rightShoulder",
                          val.target.checked,
                        )
                      }
                    >
                      Right Shoulder
                    </Checkbox>
                  </div>
                  <div>
                    <Checkbox
                      disabled={!this.props.trajectoryOptions.show}
                      checked={this.props.trajectoryOptions.rightArm}
                      onChange={(val) =>
                        this.showHideBodySection("rightArm", val.target.checked)
                      }
                    >
                      Right Arm
                    </Checkbox>
                  </div>
                  <div>
                    <Checkbox
                      disabled={!this.props.trajectoryOptions.show}
                      checked={this.props.trajectoryOptions.rightHand}
                      onChange={(val) =>
                        this.showHideBodySection(
                          "rightHand",
                          val.target.checked,
                        )
                      }
                    >
                      Right Hand
                    </Checkbox>
                  </div>
                  <div>
                    <Checkbox
                      disabled={!this.props.trajectoryOptions.show}
                      checked={this.props.trajectoryOptions.rightLeg}
                      onChange={(val) =>
                        this.showHideBodySection("rightLeg", val.target.checked)
                      }
                    >
                      Right Leg
                    </Checkbox>
                  </div>
                  <div>
                    <Checkbox
                      disabled={!this.props.trajectoryOptions.show}
                      checked={this.props.trajectoryOptions.spine}
                      onChange={(val) =>
                        this.showHideBodySection("spine", val.target.checked)
                      }
                    >
                      Spine
                    </Checkbox>
                  </div>
                </div>
                <div style={{ width: "50%", paddingRight: "8px" }}>
                  <div>
                    <Checkbox
                      disabled={!this.props.trajectoryOptions.show}
                      checked={this.props.trajectoryOptions.hips}
                      onChange={(val) =>
                        this.showHideBodySection("hips", val.target.checked)
                      }
                    >
                      Hips
                    </Checkbox>
                  </div>
                  <div>
                    <Checkbox
                      disabled={!this.props.trajectoryOptions.show}
                      checked={this.props.trajectoryOptions.leftShoulder}
                      onChange={(val) =>
                        this.showHideBodySection(
                          "leftShoulder",
                          val.target.checked,
                        )
                      }
                    >
                      Left Shoulder
                    </Checkbox>
                  </div>
                  <div>
                    <Checkbox
                      disabled={!this.props.trajectoryOptions.show}
                      checked={this.props.trajectoryOptions.leftArm}
                      onChange={(val) =>
                        this.showHideBodySection("leftArm", val.target.checked)
                      }
                    >
                      Left Arm
                    </Checkbox>
                  </div>
                  <div>
                    <Checkbox
                      disabled={!this.props.trajectoryOptions.show}
                      checked={this.props.trajectoryOptions.leftHand}
                      onChange={(val) =>
                        this.showHideBodySection("leftHand", val.target.checked)
                      }
                    >
                      Left Hand
                    </Checkbox>
                  </div>
                  <div>
                    <Checkbox
                      disabled={!this.props.trajectoryOptions.show}
                      checked={this.props.trajectoryOptions.leftLeg}
                      onChange={(val) =>
                        this.showHideBodySection("leftLeg", val.target.checked)
                      }
                    >
                      Left Leg
                    </Checkbox>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  trajectoryOptions: store.WorkspaceMenuReducer.trajectoryOptions,
}))(Component);

export const PoseVisualizationRighMenuTrajectory = Redux;
