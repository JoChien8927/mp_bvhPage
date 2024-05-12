import React from "react";
import { connect } from "react-redux";
import { ReactSVG } from "react-svg";
import { Input, Modal, Tooltip } from "antd";
import { ActionRecordingActions } from "../../../../redux/action-recording/action-recording-action";

const { TextArea } = Input;

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      addCommentModalVisibility: false,
      newComment: "",
      continueRecording: false,
    };
  }

  saveComment() {
    ActionRecordingActions.StoreCommentStart(this.state.newComment);
    this.closeAddCommentModal();
  }

  openAddCommentModal() {
    this.setState({
      newComment: "",
      addCommentModalVisibility: true,
      continueRecording: this.props.recordingState == 1,
    });
    this.props.pauseRecording();
  }

  closeAddCommentModal() {
    this.setState({ addCommentModalVisibility: false });
    if (this.state.continueRecording) this.props.startRecording();
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
          className={`recording-action ${this.props.active ? "enable" : ""}`}
          onClick={() => {
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

const Redux = connect((store) => ({}))(Component);

export const PoseVisualizationCommentAdd = Redux;
