import React from "react";
import { connect } from "react-redux";
import { WorkspaceMenuActions } from "../../../../redux/workspace-menu/workspace-menu-action";
import { AnglesActions } from "../../../../redux/angles/angles-action";
import { Switch, Checkbox } from "antd";
import { Chart } from "react-google-charts";
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
        case Actions.menu.angles.activate_inactivate:
          this.showHideAngles(data.options.show);
          break;
        case Actions.menu.angles.show_hide_angle:
          this.showHideAngle(data.options.angle, data.options.show);
          break;
      }
    });
  }

  updateAngleOptions(angleOptions) {
    this.props.dispatch(
      WorkspaceMenuActions.WorkspaceUpdateAngleOptions(angleOptions),
    );
  }

  showHideAngles(show) {
    this.updateAngleOptions({
      ...this.props.angleOptions,
      show: show,
      showGraph: show && this.props.angleOptions.showGraph,
    });

    ActionRecordingActions.StoreMenuAnglesActivateInactivate(show);

    setTimeout(() => {
      this.generateAngleGraphic();
    }, 50);
  }

  showHideAngle(angle, val) {
    this.updateAngleOptions({
      ...this.props.angleOptions,
      [angle]: val,
    });

    ActionRecordingActions.StoreMenuAnglesShowHideAngle(angle, val);

    setTimeout(() => {
      this.generateAngleGraphic();
    }, 50);
  }

  generateAngleGraphic() {
    this.updateAngleOptions({ ...this.props.angleOptions, showGraph: true });
    this.props.dispatch(AnglesActions.anglesGenerateChartStarted());
  }

  closeGraphic() {
    this.updateAngleOptions({ ...this.props.angleOptions, showGraph: false });
  }

  getCharts() {
    if (!this.props.angleOptions.show) {
      return <div></div>;
    }

    const charts = new Array();
    for (let index = 0; index < this.props.anglesDetails?.length; index++) {
      const angle = this.props.anglesDetails[index];
      if (angle.ref.length == 0) {
        continue;
      }

      const data = [["Frame", "Reference", "Student"]];
      for (let index = 0; index < angle.ref.length; index++) {
        data.push([index, angle.ref[index], angle.student[index]]);
      }

      let options = {
        title: angle.name,
        curveType: "function",
        series: [{ color: "#7C8B8F" }, { color: "#0978AC" }],
        legend: { position: "bottom" },
      };

      charts.push(
        <div key={angle.name}>
          {/* {angle.name} */}
          <Chart
            chartType="LineChart"
            width="252px"
            height="300px"
            data={data}
            options={options}
          />
          {/* <Line height={400} options={options} data={data} /> */}
        </div>,
      );
    }

    if (!charts.length) {
      charts.push(<div key={"no-angle"}>No angles selected yet.</div>);
    }

    return (
      <div className={"sub-menu-section active"}>
        <div className={"sub-menu-section-header active"}>
          <span className="sub-menu-title">Angle Data Visualization</span>
        </div>
        <div className={"sub-menu-section-body active"}>
          <div>{charts}</div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        <div className="sub-menu-wrapper">
          <div className="sub-menu-title">Analysis:</div>
          <div className="sub-menu-body">
            <div className="sub-menu-section active">
              <div
                className={
                  "sub-menu-section-header" +
                  (this.props.angleOptions.show ? " active" : "")
                }
              >
                <ReactSVG className="sub-menu-icon" src="/img/icon_angle.svg" />
                <span className="sub-menu-title">Angles</span>
                <Switch
                  checked={this.props.angleOptions.show}
                  onChange={(val) =>
                    this.showHideAngles(!this.props.angleOptions.show)
                  }
                />
              </div>
              <div
                className={
                  "sub-menu-section-body" +
                  (this.props.angleOptions.show ? " active" : "")
                }
              >
                <div style={{ paddingTop: "8px", paddingLeft: "8px" }}>
                  Which Angles to Show
                </div>
                <div style={{ display: "flex", paddingLeft: "8px" }}>
                  <div style={{ width: "50%" }}>
                    <div>
                      <Checkbox
                        disabled={!this.props.angleOptions.show}
                        checked={this.props.angleOptions.rightUpperArm}
                        onChange={(val) =>
                          this.showHideAngle(
                            "rightUpperArm",
                            val.target.checked,
                          )
                        }
                      >
                        Right Upper Arm
                      </Checkbox>
                    </div>
                    <div>
                      <Checkbox
                        disabled={!this.props.angleOptions.show}
                        checked={this.props.angleOptions.rightMiddleArm}
                        onChange={(val) =>
                          this.showHideAngle(
                            "rightMiddleArm",
                            val.target.checked,
                          )
                        }
                      >
                        Right Middle Arm{" "}
                      </Checkbox>
                    </div>
                    <div>
                      <Checkbox
                        disabled={!this.props.angleOptions.show}
                        checked={this.props.angleOptions.rightUpperLeg}
                        onChange={(val) =>
                          this.showHideAngle(
                            "rightUpperLeg",
                            val.target.checked,
                          )
                        }
                      >
                        Right Upper Leg
                      </Checkbox>
                    </div>
                    <div>
                      <Checkbox
                        disabled={!this.props.angleOptions.show}
                        checked={this.props.angleOptions.rightMiddleLeg}
                        onChange={(val) =>
                          this.showHideAngle(
                            "rightMiddleLeg",
                            val.target.checked,
                          )
                        }
                      >
                        Right Middle Leg
                      </Checkbox>
                    </div>
                  </div>
                  <div style={{ width: "50%", paddingRight: "8px" }}>
                    <div>
                      <Checkbox
                        disabled={!this.props.angleOptions.show}
                        checked={this.props.angleOptions.leftUpperArm}
                        onChange={(val) =>
                          this.showHideAngle("leftUpperArm", val.target.checked)
                        }
                      >
                        Left Upper Arm
                      </Checkbox>
                    </div>
                    <div>
                      <Checkbox
                        disabled={!this.props.angleOptions.show}
                        checked={this.props.angleOptions.leftMiddleArm}
                        onChange={(val) =>
                          this.showHideAngle(
                            "leftMiddleArm",
                            val.target.checked,
                          )
                        }
                      >
                        Left Middle Arm{" "}
                      </Checkbox>
                    </div>
                    <div>
                      <Checkbox
                        disabled={!this.props.angleOptions.show}
                        checked={this.props.angleOptions.leftUpperLeg}
                        onChange={(val) =>
                          this.showHideAngle("leftUpperLeg", val.target.checked)
                        }
                      >
                        Left Upper Leg
                      </Checkbox>
                    </div>
                    <div>
                      <Checkbox
                        disabled={!this.props.angleOptions.show}
                        checked={this.props.angleOptions.leftMiddleLeg}
                        onChange={(val) =>
                          this.showHideAngle(
                            "leftMiddleLeg",
                            val.target.checked,
                          )
                        }
                      >
                        Left Middle Leg
                      </Checkbox>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {this.getCharts()}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  angleOptions: store.WorkspaceMenuReducer.angleOptions,
  anglesDetails: store.AnglesReducer.anglesDetails,
}))(Component);

export const PoseVisualizationRighMenuAngles = Redux;
