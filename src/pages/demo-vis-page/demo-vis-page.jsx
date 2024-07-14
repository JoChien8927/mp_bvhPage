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
      selectedLabel: "pj",  // Default label
      fps : 60,
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
      {/* <div className="container">
        <div className="dropdown-container">
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              {this.state.selectedLabel}
            </Dropdown.Toggle>
            <input type="text" className="form-control" id="fps" value={this.state.fps} onChange={(e) => this.setState({ fps: e.target.value })} />
            <Dropdown.Menu>
              <Dropdown.Item href="#/action-pitching" onClick={(e) => this.selectOption(0, "pitching")}>pitching</Dropdown.Item>
              <Dropdown.Item href="#/action-batting" onClick={(e) => this.selectOption(1, "batting")}>batting</Dropdown.Item>
              <Dropdown.Item href="#/action-demo_p" onClick={(e) => this.selectOption(2, "demo_p")}>demo_p</Dropdown.Item>
              <Dropdown.Item href="#/action-demo_b" onClick={(e) => this.selectOption(3, "demo_b")}>demo_b</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
        </div>

      </div> */}
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