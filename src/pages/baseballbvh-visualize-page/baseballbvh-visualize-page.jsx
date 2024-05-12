import React from "react";
import { connect } from "react-redux";
import BaseballWorkspace from "../../components/workspace/baseballworkspace";
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
      selectedLabel: "batting",  // Default label
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
      {/* <Dropdown>
        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
          {this.state.selectedLabel}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="#/action-1" onClick={(e) => this.selectOption(0,"pitching")}>Pitching</Dropdown.Item>
          <Dropdown.Item href="#/action-2" onClick={(e) => this.selectOption(1,"batting")}>Batting</Dropdown.Item>
          <Dropdown.Item href="#/action-3" onClick={(e) => this.selectOption(2,"boxing")}>Boxing</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown> */}
      <BaseballWorkspace sportType={this.state.selectedLabel} />
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

export const baseballbvhVisualizePage = Redux;