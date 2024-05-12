import React from "react";
import { connect } from "react-redux";
import "./poses-available-component.scss";
import { PoseAnalysisSelectionAction } from "../../../redux/pose-analysis-selection/pose-analysis-selection-action";
import { VideoPreviewComponent } from "../../../components/video-preview-component/video-preview-component";
import { VideoPreviewHeaderComponent } from "../../../components/video-preview-header-component/video-preview-header-component";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.selectPose = this.selectPose.bind(this);
  }

  componentDidMount() {}

  selectPose() {
    this.props.dispatch(
      PoseAnalysisSelectionAction.SelectPose(this.props.pose),
    );
  }

  previewVideoClicked() {
    this.setState({
      previewPoseModal: true,
    });
  }

  clearState() {
    this.setState({
      previewPoseModal: false,
    });
  }

  render() {
    return (
      <React.Fragment>
        <div className="pose-available" onClick={() => this.selectPose()}>
          <div className="pose-preview">
            <VideoPreviewComponent
              height="70px"
              size="sm"
              pose={this.props.pose}
              callbackName="Select Pose"
              callback={this.selectPose}
            />
          </div>
          <div className="content">
            <VideoPreviewHeaderComponent
              showOptions={false}
              size="sm"
              pose={this.props.pose}
            />
            <div className="body">
              <div className="title">{this.props.pose.description}</div>
              <div className="tags">{this.props.pose.skillType}</div>
              <div className="duration">{this.props.pose.duration}</div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({}))(Component);

export const PoseAvailable = Redux;
