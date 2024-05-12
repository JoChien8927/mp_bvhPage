import React from "react";
import { connect } from "react-redux";
// import Plotly from "plotly.js-gl3d-dist";
// import createPlotlyComponent from "react-plotly.js/factory";
import { Workspace } from "../../../components/workspace/workspace";
import "./pose-visualization-annotation.scss";
import { AlertComponent } from "../../../components/alert-component/alert-component";
import { PoseVisualizationRighMenuWrapper } from "./pose-visualization-right-menu/pose-visualization-right-menu-wrapper";
// const Plot = createPlotlyComponent(Plotly);

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      headerKey: 0,
    };

    this.selectOption = this.selectOption.bind(this);
  }

  componentDidMount() {}

  selectOption(option) {
    this.setState({
      headerKey: option,
    });
  }

  render() {
    return (
      <React.Fragment>
        <div className="pose-annotation">
          {(() => {
            if (this.props.alertReducer.show) return <AlertComponent />;
          })()}
          <div
            className="content"
            style={{
              height: this.props.style.canvasWrapperVH,
              maxHeight: this.props.style.canvasWrapperMaxVH,
            }}
          >
            <div
              id="drawer-container"
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                flexWrap: "wrap",
                display: "flex",
                overflow: "hidden",
              }}
            >
              <PoseVisualizationRighMenuWrapper></PoseVisualizationRighMenuWrapper>
              <Workspace
                poses={this.props.currentAnalysis.poses}
                sessionSourceType="mediapipe"
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  alertReducer: store.AlertReducer,
  currentAnalysis: store.TrainingAnalysisReducer.currentAnalysis,
  actionRecording: store.ActionRecordingReducer,
  style: store.StyleReducer,
}))(Component);

export const PoseVisualizationAnnotation = Redux;
