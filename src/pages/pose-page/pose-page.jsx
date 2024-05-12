import React from "react";
import { connect } from "react-redux";
import { MainHeaderComponent } from "../../components/main-header-component/main-header-component";
import { UserPoseAnalysisComponent } from "../../components/user-pose-analysis-component/user-pose-analysis-component";
import "./pose.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <MainHeaderComponent headerKey={0} />
        <UserPoseAnalysisComponent />
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({}))(Component);

export const PosePage = Redux;
