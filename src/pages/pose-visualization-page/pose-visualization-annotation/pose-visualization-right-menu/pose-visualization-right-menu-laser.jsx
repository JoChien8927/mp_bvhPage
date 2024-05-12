import React from "react";
import { connect } from "react-redux";
import { WorkspaceMenuActions } from "../../../../redux/workspace-menu/workspace-menu-action";
import { Switch, Slider, Tooltip } from "antd";
import { ReactSVG } from "react-svg";
import { CirclePicker } from "react-color";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showPalette: false,
    };
  }

  updateLaserOptions(laserOptions) {
    this.props.dispatch(
      WorkspaceMenuActions.WorkspaceUpdateLaserOptions(laserOptions),
    );
  }

  showHideLaser() {
    this.updateLaserOptions({
      ...this.props.laserOptions,
      show: !this.props.laserOptions.show,
    });
  }

  setBrushColor(color) {
    this.setState(
      {
        showPalette: !this.state.showPalette,
      },
      this.updateLaserOptions({
        ...this.props.laserOptions,
        brushColor: color.hex,
      }),
    );
  }

  render() {
    return (
      <React.Fragment>
        <div className="sub-menu-wrapper">
          <div className="sub-menu-title">Laser:</div>
          <div className="sub-menu-section active">
            <div
              className={
                "sub-menu-section-header" +
                (this.props.laserOptions.show ? " active" : "")
              }
            >
              <ReactSVG className="sub-menu-icon" src="/img/icon_body.svg" />
              <span className="sub-menu-title">Laser</span>
              <Switch
                checked={this.props.laserOptions.show}
                onChange={(val) => this.showHideLaser()}
              />
            </div>
            <div
              className={
                "sub-menu-section-body" +
                (this.props.laserOptions.show ? " active" : "")
              }
            >
              <div style={{ paddingTop: "5px", paddingLeft: "8px" }}>
                <div>
                  <div style={{ paddingTop: "5px", paddingLeft: "5px" }}>
                    Brush Size
                  </div>
                  <Slider
                    style={{ width: "calc(100% - 16px)", margin: "0px 8px" }}
                    disabled={!this.props.laserOptions.show}
                    min={10}
                    max={30}
                    onChange={(val) =>
                      this.updateLaserOptions({
                        ...this.props.laserOptions,
                        brushRadius: val,
                      })
                    }
                    value={this.props.laserOptions.brushRadius}
                  />
                  <div
                    style={{
                      paddingBottom: "5px",
                      display: "flex",
                      justifyContent: "right",
                    }}
                  >
                    <div
                      onClick={() => {
                        this.setState({ showPalette: !this.state.showPalette });
                      }}
                    >
                      <Tooltip placement="top" title={"Pencil Color"}>
                        <ReactSVG
                          className={
                            "sub-menu-action-icon" +
                            (!this.props.laserOptions.show
                              ? " disabled"
                              : " enabled") +
                            (this.state.showPalette ? " active" : "")
                          }
                          src="/img/icon_color.svg"
                        />
                      </Tooltip>
                    </div>
                  </div>
                  {(() => {
                    if (this.state.showPalette) {
                      return (
                        <div style={{ paddingTop: "10px" }}>
                          <CirclePicker
                            color={this.state.brushColor}
                            onChangeComplete={(color) =>
                              this.setBrushColor(color)
                            }
                          />
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  laserOptions: store.WorkspaceMenuReducer.laserOptions,
}))(Component);

export const PoseVisualizationRighMenuLaser = Redux;
