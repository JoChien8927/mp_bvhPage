import React from "react";
import { connect } from "react-redux";
import { ReactSVG } from "react-svg";
import { Input } from "antd";
import { TrainingPoseAction } from "../../../../../redux/training-poses/training-poses-action";
const { TextArea } = Input;

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: props.comment,
    };
  }

  showHideComment() {
    const trainingPose = this.props.currentSession;

    trainingPose.inProgressRecordings =
      this.props.currentSession.inProgressRecordings.map((x) => {
        if (x.id == this.state.comment.id) {
          x.show = !x.show;
        } else {
          x.show = false;
        }
        return x;
      });

    this.props.dispatch(
      TrainingPoseAction.TrainingPoseOpenComment(trainingPose),
    );
  }

  editComment() {
    this.props.dispatch(
      TrainingPoseAction.TrainingPoseEditCommentStart(
        this.props.currentSession?._id,
        this.state.comment,
      ),
    );

    this.showHideComment();
  }

  render() {
    return (
      <React.Fragment>
        <div className="commentWrapper">
          <ReactSVG
            className="comment"
            src="/img/icon_comment.svg"
            onClick={() => this.showHideComment()}
          />
          <div
            className={
              "commentEditor " +
              (this.state.comment.show ? "commentEditorActive" : "")
            }
          >
            <TextArea
              maxLength={100}
              rows={2}
              value={this.state.comment.comment}
              onChange={(e) => {
                this.setState({
                  comment: { ...this.state.comment, comment: e.target.value },
                });
              }}
            />
            <div
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
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  currentSession: store.TrainingPoseReducer.current_session,
}))(Component);

export const PoseVisualizationEditCommentOld = Redux;
