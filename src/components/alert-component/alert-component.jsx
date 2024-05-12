import React from "react";
import { AlertAction } from "../../redux/alert/alert-action";
import { connect } from "react-redux";
import { Button, Modal } from "antd";

class Component extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Modal
          open={this.props.AlertReducer.show}
          onCancel={() => {
            this.props.dispatch(AlertAction.alertStop());
          }}
          OnOk={() => {
            this.props.dispatch(AlertAction.alertStop());
          }}
          title={this.props.AlertReducer.title}
          footer={[
            <Button
              key="okay"
              onClick={() => {
                this.props.dispatch(AlertAction.alertStop());
              }}
            >
              Okay
            </Button>,
          ]}
        >
          {this.props.AlertReducer.message}
        </Modal>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  AlertReducer: store.AlertReducer,
}))(Component);

export const AlertComponent = Redux;
