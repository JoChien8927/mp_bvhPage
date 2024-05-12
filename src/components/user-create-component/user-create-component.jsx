import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import ImgCrop from "antd-img-crop";

import { Translation } from "react-i18next";
import { Input, Modal, Upload } from "antd";
import { LoginAction } from "../../redux/login/login-action";
import "./user-create-component.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      loginUsername: "",
      loginPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
    };
  }

  createUser() {
    this.props.dispatch(
      LoginAction.LoginCreateStart(
        JSON.stringify({
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          email: this.state.email,
          username: this.state.username,
          password: this.state.password,
        }),
        this.state.fileList.length ? this.state.fileList[0].file : null,
      ),
    );
  }

  openCreateAccountModal() {
    this.clearState();
    this.props.dispatch(LoginAction.LoginOpenCreate());
  }

  closeCreateAccountModal() {
    this.props.dispatch(LoginAction.LoginCreateModalClose());
    this.clearState();
  }

  clearState() {
    this.setState({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      fileList: [],
    });
  }

  onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  onChange = (fileList) => {};

  onUploadFile = async (event) => {
    const fileData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(event.file);
      reader.onload = () => resolve(reader.result);
    });

    this.setState({
      fileList: [
        {
          url: fileData,
          file: event.file,
        },
      ],
    });
  };

  onRemovePhoto = (event) => {
    this.setState({
      fileList: [],
    });
  };

  render() {
    return (
      <Translation>
        {(t, { i18n }) => (
          <React.Fragment>
            <div style={{ padding: "10px" }}>
              <a
                onClick={() => {
                  this.openCreateAccountModal();
                }}
                href="#"
                style={{ color: "#888888", fontSize: "0.9em" }}
              >
                {t("login.create_account")}
              </a>
            </div>
            <Modal
              centered
              // title="Sign Up"
              open={this.props.LoginReducer.createAccountModalVisible}
              onCancel={() => {
                this.closeCreateAccountModal();
              }}
              footer={[]}
            >
              <div
                className="skeleton-modal-header"
                style={{ fontSize: "2.2em", paddingBottom: "15px" }}
              >
                {t("login.new_account.title")}
              </div>
              <div className="skeleton-modal">
                <ImgCrop rotate>
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    onChange={this.onChange}
                    onRemove={this.onRemovePhoto}
                    fileList={this.state.fileList}
                    customRequest={(event) => this.onUploadFile(event)}
                    onPreview={this.onPreview}
                  >
                    Upload Photo
                  </Upload>
                </ImgCrop>
                <div style={{ color: "black", opacity: 1 }}>
                  <span style={{ color: "rgb(255, 77, 79)" }}>{"* "}</span>
                  {t("login.new_account.first_name")}
                </div>
                <Input
                  value={this.state.firstName}
                  onChange={(e) => {
                    this.setState({ firstName: e.target.value });
                  }}
                />

                <div
                  style={{ color: "black", opacity: 1, paddingTop: "11.75px" }}
                >
                  <span style={{ color: "rgb(255, 77, 79)" }}>{"* "}</span>
                  {t("login.new_account.last_name")}
                </div>
                <Input
                  value={this.state.lastName}
                  onChange={(e) => {
                    this.setState({ lastName: e.target.value });
                  }}
                />
                <div
                  style={{ color: "black", opacity: 1, paddingTop: "11.75px" }}
                >
                  <span style={{ color: "rgb(255, 77, 79)" }}>{"* "}</span>
                  {t("login.new_account.email")}
                </div>
                <Input
                  value={this.state.email}
                  onChange={(e) => {
                    this.setState({ email: e.target.value });
                  }}
                />
                <div
                  style={{ color: "black", opacity: 1, paddingTop: "11.75px" }}
                >
                  <span style={{ color: "rgb(255, 77, 79)" }}>{"* "}</span>
                  {t("login.new_account.username")}
                </div>
                <Input
                  value={this.state.username}
                  onChange={(e) => {
                    this.setState({ username: e.target.value });
                  }}
                />

                <div
                  style={{ color: "black", opacity: 1, paddingTop: "11.75px" }}
                >
                  <span style={{ color: "rgb(255, 77, 79)" }}>{"* "}</span>
                  {t("login.new_account.password")}
                </div>
                <Input.Password
                  style={{
                    marginBottom: "30px",
                  }}
                  value={this.state.password}
                  onChange={(e) => {
                    this.setState({ password: e.target.value });
                  }}
                />
                <button
                  className="skeleton-button"
                  key="submit"
                  variant="success"
                  onClick={() => {
                    this.createUser();
                  }}
                >
                  {t("login.new_account.register")}
                </button>
              </div>
            </Modal>
          </React.Fragment>
        )}
      </Translation>
    );
  }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({
  LoginReducer: store.LoginReducer,
  AlertReducer: store.AlertReducer,
}))(Router);

export const UserCreateComponent = Redux;
