import React from "react";
import { connect } from "react-redux";
import "./pose-selection-preview-component.scss";
import { withRouter } from "react-router-dom";
import { ReactSVG } from "react-svg";
import { PoseSelectionPreviewPose } from "./pose-selection-preview-pose-component";
import { AlertAction } from "../../../redux/alert/alert-action";
import { AlertComponent } from "../../../components/alert-component/alert-component";
import { PoseAnalysisSelectionAction } from "../../../redux/pose-analysis-selection/pose-analysis-selection-action";

class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  cancel() {
    const mainId = this.props.posesSelected.find((x) => x.isMain)._id;
    this.props.history.push("/poses/" + mainId);
  }

  switchOrder() {
    this.props.dispatch(PoseAnalysisSelectionAction.SwitchPosesOrder());
  }

  start() {
    if (this.props.posesSelected.find((x) => !x._id)) {
      this.props.dispatch(
        AlertAction.alertStart("Error", "Please select all poses to analyze."),
      );

      return;
    }

    var poses = this.props.posesSelected.map((x) => {
      return {
        pose: x._id,
        index: x.index,
        isMainPose: x.isMainPose,
      };
    });

    this.props.dispatch(
      PoseAnalysisSelectionAction.NewAnalysisStart(
        poses,
        this.redirect.bind(this),
      ),
    );
  }

  redirect(analysisId) {
    this.props.history.push(`/training_analysis/${analysisId}`);
  }

  render() {
    return (
      <React.Fragment>
        {(() => {
          if (this.props.AlertReducer.show) return <AlertComponent />;
        })()}
        <div className="pose-selection-preview-wrapper">
          <div
            style={{
              height: this.props.style.posesAvailableBackgroundVH,
              maxHeight: this.props.style.posesAvailableBackgroundMaxVH,
            }}
            className="preview-background"
          ></div>
          <div
            className="pose-selection-preview"
            style={{
              height: this.props.style.posesAvailableVH,
              maxHeight: this.props.style.posesAvailableMaxVH,
            }}
          >
            <div className="preview-wrapper">
              <PoseSelectionPreviewPose
                pose={this.props.posesSelected[0]}
                position="first"
                amount="two"
              />
              <div
                onClick={() => this.switchOrder()}
                className="preview-switch preview-switch-two preview-switch-first"
              >
                <ReactSVG className="search-icon" src="/img/icon_arrows.svg" />
              </div>
              <PoseSelectionPreviewPose
                pose={this.props.posesSelected[1]}
                position="second"
                amount="two"
              />
              {/* <div className="preview-switch preview-switch-three preview-switch-second">
                <ReactSVG className="search-icon" src="/img/icon_arrows.svg" />
              </div>
              <PoseSelectionPreviewPose
                pose={this.props.posesSelected[2]}
                position="third"
                amount="three"
              /> */}
            </div>

            <div className="preview-options">
              <div className="left">
                {/* <div className="custom-button light">Add new comparison</div> */}
              </div>
              <div className="right">
                <div
                  className="custom-button light"
                  onClick={() => this.cancel()}
                >
                  Cancel
                </div>
                <div
                  className="ml-2 custom-button primary"
                  onClick={() => this.start()}
                >
                  Start to Analyze
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);
const Redux = connect((store) => ({
  style: store.StyleReducer,
  posesSelected: store.PoseAnalysisSelectionReducer.posesSelected,
  analysisId: store.PoseAnalysisSelectionReducer.analysisId,
  AlertReducer: store.AlertReducer,
}))(Router);

export const PoseSelectionPreview = Redux;
