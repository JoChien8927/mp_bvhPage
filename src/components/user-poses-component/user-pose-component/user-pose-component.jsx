import React from "react";
import "./user-pose-component.scss";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import Grid from "@material-ui/core/Grid";
import "./user-pose-component.scss";
import { VideoPreviewComponent } from "../../video-preview-component/video-preview-component";
import { VideoPreviewHeaderComponent } from "../../video-preview-header-component/video-preview-header-component";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.poseAnalisis = this.poseAnalisis.bind(this);
  }

  poseAnalisis() {
    this.props.history.push("/poses/" + this.props.pose._id);
  }

  render() {
    return (
      <React.Fragment>
        <Grid
          className="user-pose"
          key={this.props.pose._id}
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          xl={2}
        >
          <div className="pose-wrapper">
            <VideoPreviewHeaderComponent
              showOptions={true}
              pose={this.props.pose}
              paddingBottom="5px"
            />
            <VideoPreviewComponent
              paddingBottom="10px"
              height="200px"
              callbackName="Pose Analysis"
              callback={this.poseAnalisis}
              pose={this.props.pose}
            />
            <div className="pose-footer">
              <div className="pose-name">{this.props.pose.description}</div>
              <div className="pose-tags">{this.props.pose.skillType}</div>
              <div className="duration">{this.props.pose.duration}</div>
              <div
                className="custom-button light text-center"
                onClick={() => this.poseAnalisis()}
              >
                Pose Analysis
              </div>
            </div>
          </div>
        </Grid>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);
const Redux = connect((store) => ({}))(Router);

export const UserPoseComponent = Redux;
