import React from "react";
import { connect } from "react-redux";
import { ReactSVG } from "react-svg";
import { Input } from "antd";
import { TrainingPoseAction } from "../../../../redux/training-poses/training-poses-action";
const { TextArea } = Input;

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: props.comment,
      show: false,
    };
  }

  showHideComment() {
    this.setState({
      show: !this.state.show,
      commentCopy: this.state.comment.options.comment,
    });

    // const trainingPose = this.props.currentSession;
    // trainingPose.inProgressRecordings =
    //   this.props.currentSession.inProgressRecordings.map((x) => {
    //     if (x.id == this.state.comment.id) {
    //       x.show = !x.show;
    //     } else {
    //       x.show = false;
    //     }
    //     return x;
    //   });
    // this.props.dispatch(
    //   TrainingPoseAction.TrainingPoseOpenComment(trainingPose),
    // );
  }

  editComment() {
    // this.props.dispatch(
    //   TrainingPoseAction.TrainingPoseEditCommentStart(
    //     this.props.currentSession?._id,
    //     this.state.comment,
    //   ),
    // );

    this.showHideComment();
  }

  render() {
    return (
      <React.Fragment>
        <div className="commentWrapper">
          <div className="marker"></div>
          <ReactSVG
            className="comment"
            src="/img/icon_message.svg"
            onClick={() => this.showHideComment()}
          />
          <div className={"commentEditor " + (this.state.show ? "active" : "")}>
            <ReactSVG
              className="commentClose"
              src="/img/icon_close.svg"
              onClick={() => this.showHideComment()}
            />

            <TextArea maxLength={100} rows={2} value={this.state.commentCopy} />
            {/* <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "end",
              }}
            >
              <ReactSVG
                className="commentSave"
                src="/img/icon_check.svg"
                onClick={() => this.editComment()}
              />
              <ReactSVG
                className="commentSave"
                src="/img/icon_close_circle.svg"
                onClick={() => this.showHideComment()}
              />
            </div> */}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({}))(Component);

export const PoseVisualizationCommentView = Redux;
