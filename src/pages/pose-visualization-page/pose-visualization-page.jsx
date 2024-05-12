import React from "react";
import { connect } from "react-redux";
import "./pose-visualization-page.scss";
import { AlertComponent } from "../../components/alert-component/alert-component";
import { MainHeaderComponent } from "../../components/main-header-component/main-header-component";
import { TrainingAnalysisAction } from "../../redux/training-analysis/training-analysis-action";
import { PoseVisualizationAnnotation } from "./pose-visualization-annotation/pose-visualization-annotation";
import { PoseVisualizationDiscussion } from "./pose-visualization-discussion/pose-visualization-discussion";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      headerKey: 0,
    };

    this.selectOption = this.selectOption.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(
      TrainingAnalysisAction.GetStart(this.props.match.params.analysis_id),
    );
  }

  selectOption(option) {
    this.setState({
      headerKey: option,
    });
  }

  render() {
    return (
      <React.Fragment>
        {(() => {
          if (this.props.alertReducer.show) return <AlertComponent />;
        })()}
        {/* < div style={{ height: "100vh", overflowX: "hidden" }}> */}
        <MainHeaderComponent>
          headerKey={this.state.headerKey}
          selectOption={this.selectOption}
        </MainHeaderComponent>
        <div className="box">
          {(() => {
            if (
              this.props.match.params.analysis_id ==
              this.props.currentAnalysis?._id
            ) {
              if (this.state.headerKey == 0) {
                return <PoseVisualizationAnnotation />;
              } else {
                return <PoseVisualizationDiscussion />;
              }
            }
          })()}
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  alertReducer: store.AlertReducer,
  currentAnalysis: store.TrainingAnalysisReducer.currentAnalysis,
}))(Component);

export const PoseVisualizationPage = Redux;
