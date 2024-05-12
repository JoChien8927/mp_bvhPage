import React from "react";
import { connect } from "react-redux";
import { MainHeaderComponent } from "../../components/main-header-component/main-header-component";
import { PoseSelectionPreview } from "./pose-selection-preview-component/pose-selection-preview-component";
import { PosesAvailable } from "./poses-available-component/poses-available-component";
import { PoseAnalysisSelectionAction } from "../../redux/pose-analysis-selection/pose-analysis-selection-action";

import "./pose-analysis-selection-page.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mainPoseId: this.props.match.params.pose_id,
    };
  }

  componentDidMount() {
    this.props.dispatch(
      PoseAnalysisSelectionAction.LoadStart(this.state.mainPoseId),
    );
  }

  render() {
    return (
      <React.Fragment>
        <MainHeaderComponent headerKey={0} />
        <div className="pose-selection-wrapper">
          {(() => {
            if (this.state.mainPoseId == this.props.mainPoseId) {
              return (
                <React.Fragment>
                  <PosesAvailable />
                  <PoseSelectionPreview />
                </React.Fragment>
              );
            }
          })()}
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  userId: store.PoseAnalysisSelectionReducer.userId,
  mainPoseId: store.PoseAnalysisSelectionReducer.mainPoseId,
}))(Component);

export const PoseAnalysisSelectionPage = Redux;
