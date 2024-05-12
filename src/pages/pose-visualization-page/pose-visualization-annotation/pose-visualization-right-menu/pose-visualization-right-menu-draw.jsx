import React from "react";
import { connect } from "react-redux";
import { WorkspaceMenuActions } from "../../../../redux/workspace-menu/workspace-menu-action";
import { Switch, Slider, Tooltip } from "antd";
import { ReactSVG } from "react-svg";
import { CirclePicker } from "react-color";
import { ActionRecordingActions } from "../../../../redux/action-recording/action-recording-action";
import { Actions } from "../../../../redux/action-recording/action";
import { currentActionRecording$ } from "../../../../redux/action-recording/action-recording-action";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showPalette: false,
    };

    currentActionRecording$.subscribe((data) => {
      switch (data.action) {
        case Actions.menu.draw.activate_inactivate:
          this.activateInactivate(data.options.show);
          break;
        case Actions.menu.draw.brush_size:
          this.setBrushSize(data.options.brushSize);
          break;
        case Actions.menu.draw.color:
          this.setBrushColor(data.options.color);
          break;
        case Actions.menu.draw.pencil_selected:
          this.activateDrawPencil();
          break;
        case Actions.menu.draw.eraser_selected:
          this.activateDrawEraser();
          break;
        case Actions.menu.draw.clear:
          this.clearDraw();
          break;
        case Actions.menu.draw.undo:
          this.undoDraw();
          break;
        case Actions.menu.draw.redo:
          this.redoDraw();
          break;
      }
    });
  }

  updateDrawOptions(drawOptions) {
    this.props.dispatch(
      WorkspaceMenuActions.WorkspaceUpdateDrawOptions(drawOptions),
    );
  }

  setBrushSize(size) {
    this.updateDrawOptions({ ...this.props.drawOptions, brushRadius: size });
    ActionRecordingActions.StoreDrawBrushSizeSelected(size);
  }

  activateInactivate(show) {
    this.updateDrawOptions({ ...this.props.drawOptions, show: show });
    ActionRecordingActions.StoreMenuDrawActivateInactivate(show);
  }

  activateDrawPencil() {
    if (!this.props.drawOptions.show) {
      return;
    }

    this.updateDrawOptions({
      ...this.props.drawOptions,
      drawPencilActive: true,
      drawEraserActive: false,
    });

    ActionRecordingActions.StoreDrawPencilSelected();
  }

  activateDrawEraser() {
    if (!this.props.drawOptions.show) {
      return;
    }

    this.updateDrawOptions({
      ...this.props.drawOptions,
      drawPencilActive: false,
      drawEraserActive: true,
    });

    ActionRecordingActions.StoreDrawEraserSelected();
  }

  setBrushColor(color) {
    this.setState(
      {
        showPalette: false,
      },

      this.updateDrawOptions({
        ...this.props.drawOptions,
        drawPencilActive: true,
        drawEraserActive: false,
        brushColor: color.hex,
      }),
    );

    ActionRecordingActions.StoreDrawColorSelected(color);
  }

  clearDraw() {
    this.props.dispatch(WorkspaceMenuActions.WorkspaceClearDraw());
    ActionRecordingActions.StoreDrawClear();
  }

  undoDraw() {
    this.props.dispatch(WorkspaceMenuActions.WorkspaceUndoDraw());
    ActionRecordingActions.StoreDrawUndo();
  }

  redoDraw() {
    this.props.dispatch(WorkspaceMenuActions.WorkspaceRedoDraw());
    ActionRecordingActions.StoreDrawRedo();
  }

  render() {
    return (
      <React.Fragment>
        <div className="sub-menu-wrapper">
          <div className="sub-menu-title">Annotations:</div>
          <div className="sub-menu-section active">
            <div
              className={
                "sub-menu-section-header" +
                (this.props.drawOptions.show ? " active" : "")
              }
            >
              <ReactSVG className="sub-menu-icon" src="/img/icon_body.svg" />
              <span className="sub-menu-title">Drawing</span>
              <Switch
                checked={this.props.drawOptions.show}
                onChange={(val) =>
                  this.activateInactivate(!this.props.drawOptions.show)
                }
              />
            </div>
            <div
              className={
                "sub-menu-section-body" +
                (this.props.drawOptions.show ? " active" : "")
              }
            >
              <div style={{ paddingTop: "5px", paddingLeft: "8px" }}>
                <div>
                  <div style={{ paddingTop: "5px", paddingLeft: "5px" }}>
                    Brush Size
                  </div>
                  <Slider
                    style={{ width: "calc(100% - 16px)", margin: "0px 8px" }}
                    disabled={!this.props.drawOptions.show}
                    min={1}
                    max={20}
                    onChange={(val) => this.setBrushSize(val)}
                    value={this.props.drawOptions.brushRadius}
                  />
                  <div
                    style={{
                      paddingBottom: "5px",
                      display: "flex",
                      justifyContent: "right",
                    }}
                  >
                    <div onClick={() => this.activateDrawPencil()}>
                      <Tooltip placement="top" title={"Pencil"}>
                        <ReactSVG
                          className={
                            "sub-menu-action-icon" +
                            (!this.props.drawOptions.show
                              ? " disabled"
                              : " enabled") +
                            (this.props.drawOptions.drawPencilActive
                              ? " active"
                              : "")
                          }
                          src="/img/icon_draw.svg"
                        />
                      </Tooltip>
                    </div>
                    <div onClick={() => this.activateDrawEraser()}>
                      <Tooltip placement="top" title={"Eraser"}>
                        <ReactSVG
                          className={
                            "sub-menu-action-icon" +
                            (!this.props.drawOptions.show
                              ? " disabled"
                              : " enabled") +
                            (this.props.drawOptions.drawEraserActive
                              ? " active"
                              : "")
                          }
                          src="/img/icon_eraser.svg"
                        />
                      </Tooltip>
                    </div>
                    <div
                      onClick={() => {
                        this.setState({ showPalette: !this.state.showPalette });
                      }}
                    >
                      <Tooltip placement="top" title={"Pencil Color"}>
                        <ReactSVG
                          className={
                            "sub-menu-action-icon" +
                            (!this.props.drawOptions.show
                              ? " disabled"
                              : " enabled") +
                            (this.state.showPalette ? " active" : "")
                          }
                          src="/img/icon_color.svg"
                        />
                      </Tooltip>
                    </div>
                    <div
                      onClick={() => {
                        this.undoDraw();
                      }}
                    >
                      <Tooltip title="Undo" placement="top">
                        <ReactSVG
                          className={
                            "sub-menu-action-icon" +
                            (!this.props.drawOptions.show
                              ? " disabled"
                              : " enabled")
                          }
                          src="/img/icon_undo.svg"
                        />
                      </Tooltip>
                    </div>
                    <div
                      onClick={() => {
                        this.redoDraw();
                      }}
                    >
                      <Tooltip title="Redo" placement="top">
                        <ReactSVG
                          className={
                            "sub-menu-action-icon" +
                            (!this.props.drawOptions.show
                              ? " disabled"
                              : " enabled")
                          }
                          src="/img/icon_redo.svg"
                        />
                      </Tooltip>
                    </div>
                    <div
                      onClick={() => {
                        this.clearDraw();
                      }}
                    >
                      <Tooltip placement="top" title={"Clear"}>
                        <ReactSVG
                          className={
                            "sub-menu-action-icon" +
                            (!this.props.drawOptions.show
                              ? " disabled"
                              : " enabled")
                          }
                          src="/img/icon_delete.svg"
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
  drawOptions: store.WorkspaceMenuReducer.drawOptions,
}))(Component);

export const PoseVisualizationRighMenuDraw = Redux;
