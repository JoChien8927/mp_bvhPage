import React from "react";
import { connect } from "react-redux";
import { ReactSVG } from "react-svg";
import { Input, Modal, Tooltip } from "antd";
import { TrainingPoseAction } from "../../../../redux/training-poses/training-poses-action";
const { TextArea } = Input;

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      addCommentModalVisibility: false,
      newComment: "",
    };
  }

  saveComment() {
    this.closeAddCommentModal();
    this.props.dispatch(
      TrainingPoseAction.TrainingPoseAddCommentStart(
        this.props.currentSession?.user,
        this.props.currentSession?._id,
        this.state.newComment,
      ),
    );
  }

  openAddCommentModal() {
    this.setState({ newComment: "", addCommentModalVisibility: true });
  }

  closeAddCommentModal() {
    this.setState({ addCommentModalVisibility: false });
  }

  render() {
    return (
      <React.Fragment>
        <Modal
          centered
          title="New Comment"
          open={this.state.addCommentModalVisibility}
          onCancel={() => {
            this.setState({
              addCommentModalVisibility: false,
            });
          }}
          footer={[]}
        >
          <div className="skeleton-modal">
            <TextArea
              rows={4}
              showCount
              maxLength={100}
              style={{
                marginBottom: "30px",
              }}
              value={this.state.newComment}
              onChange={(e) => {
                this.setState({ newComment: e.target.value });
              }}
            />
            <div style={{ textAlign: "right" }}>
              <button
                className="skeleton-button"
                key="submit"
                variant="success"
                onClick={() => {
                  this.saveComment();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
        <div
          className="recording-action"
          onClick={() => {
            this.props.stopRecording();
            this.openAddCommentModal();
          }}
        >
          <Tooltip title="Add Comment" placement="top">
            <ReactSVG src="/img/icon_add_comment.svg" />
          </Tooltip>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  currentSession: store.TrainingPoseReducer.current_session,
}))(Component);

export const PoseVisualizationAddCommentOld = Redux;
