import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./user-pose-analysis-component.scss";
import { PoseAnalysisAction } from "../../redux/pose-analysis/pose-analysis-action";
import { UserPoseAnalysisHeaderComponent } from "./user-pose-analysis-header-component";
import { UserPoseAnalysisBodyComponent } from "./user-pose-analysis-body-component";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      poseId: this.props.match.params.pose_id,
    };
  }

  componentDidMount() {
    this.props.dispatch(PoseAnalysisAction.GetPoseStart(this.state.poseId));
  }

  render() {
    return (
      <React.Fragment>
        <div className="pose-analysis-wrapper">
          {(() => {
            if (this.state.poseId == this.props.poseId) {
              return (
                <React.Fragment>
                  <UserPoseAnalysisHeaderComponent />
                  <UserPoseAnalysisBodyComponent />
                </React.Fragment>
              );
            }
          })()}
        </div>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({
  currentPose: store.PoseAnalysisReducer.currentPose,
  poseId: store.PoseAnalysisReducer.poseId,
}))(Router);

export const UserPoseAnalysisComponent = Redux;
