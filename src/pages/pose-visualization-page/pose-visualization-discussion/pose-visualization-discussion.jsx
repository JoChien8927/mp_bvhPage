import React from "react";
import { connect } from "react-redux";
import "./pose-visualization-discussion.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <React.Fragment>Discussion</React.Fragment>;
  }
}

const Redux = connect((store) => ({}))(Component);

export const PoseVisualizationDiscussion = Redux;
