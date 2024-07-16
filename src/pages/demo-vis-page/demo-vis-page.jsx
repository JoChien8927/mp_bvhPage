import React from "react";
import { connect } from "react-redux";
import BaseballWorkspace from "../../components/workspace/baseballworkspace";
// import  sWorkspace  from "../../components/workspace/sworkspace";
import "./pose-visualization-annotation.scss";
import { AlertComponent } from "../../components/alert-component/alert-component";
import { PoseVisualizationRighMenuWrapper } from "../pose-visualization-page/pose-visualization-annotation/pose-visualization-right-menu/pose-visualization-right-menu-wrapper";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown } from 'react-bootstrap';

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sportType: 0,
      selectedLabel: "demo",  // Default label
      fps : 150,
    };

    this.selectOption = this.selectOption.bind(this);
  }
  selectOption(sportType, label) {
    this.setState({
      sportType: sportType,
      selectedLabel: label,
    });
  }
  componentDidMount() {}


  render() {
  return (
    <React.Fragment>
      <h5 className="text-center">Baseball BVH Visualize Page</h5>
      <BaseballWorkspace sportType={this.state.selectedLabel} fps={this.state.fps}/>
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

export const demoVisPage = Redux;