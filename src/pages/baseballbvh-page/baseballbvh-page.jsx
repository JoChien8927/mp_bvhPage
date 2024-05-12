import React from "react";
import { connect } from "react-redux";
import BaseballWorkspace from "../../components/workspace/baseballworkspace";
import "./pose-visualization-annotation.scss";
import { AlertComponent } from "../../components/alert-component/alert-component";
import { PoseVisualizationRighMenuWrapper } from "../pose-visualization-page/pose-visualization-annotation/pose-visualization-right-menu/pose-visualization-right-menu-wrapper";

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
        <div>
            <BaseballWorkspace calibration_id={this.props.match.params.calibration_id} recording_id={this.props.match.params.recording_id}
            />
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

export const baseballbvhPage = Redux;