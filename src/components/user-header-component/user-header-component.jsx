import React from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import "./user-header-component.scss";
import {Button, Modal, Upload} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import Grid from "@material-ui/core/Grid";
import {UserPictureAction} from "../../redux/user-profile/user-profile-action";
import UserProfileImage from "./user-profile-image-component/user-profile-image-component";

class Component extends React.Component {
    constructor(props) {
        super(props);
    }

    onUpdate() {
        //TODO: connect update image API
        console.log("update a picture")
    }

    render() {
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
        };

        return (
            <React.Fragment>
                <div className="user-header">
                    <div
                        className="user-background"
                        style={{
                            backgroundImage: `url(${
                                process.env.PUBLIC_URL + "/img/background_example.png"
                            })`,
                        }}></div>
                    <div className="user-details row">
                        <div className="user-info-wrapper col-sm-12 col-md-6">
                            <UserProfileImage onUpdate={this.onUpdate} user={this.props.user} url={process.env.PUBLIC_URL}/>
                            <div className="user-personal-info">
                                <div className="user-name">
                                    {this.props.user.firstName} {this.props.user.lastName}
                                </div>
                                <div className="user-username">
                                    @{this.props.user.username} - Last login on{" "}
                                    {new Date(this.props.user.lastLoggedIn).toLocaleDateString(
                                        "en-US",
                                        options
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="user-stats col-sm-12 col-md-6">
                            {/* <div className="user-stat">
                <div className="title">Groups</div>
                <div>0</div>
              </div>
              <div className="user-stat">
                <div className="title">Friends</div>
                <div>0</div>
              </div>
              <div className="user-stat">
                <div className="title">Videos</div>
                <div>0</div>
              </div>
              <div className="user-stat">
                <div className="title">Analysis</div>
                <div>0</div>
              </div> */}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({
    user: store.LoginReducer.user,
}))(Router);

export const UserHeaderComponent = Redux;
