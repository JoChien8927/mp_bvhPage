import React from "react";
import debounce from "lodash.debounce";

import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./user-friends-component.scss";

import { LoadingOutlined } from "@ant-design/icons";
import { Input, Select, Menu, Button, Modal, Upload, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import Grid from "@material-ui/core/Grid";

import { ReactSVG } from "react-svg";

import { TrainingPoseAction } from "../../redux/training-poses/training-poses-action";
import { UserCardComponent } from "../user-card-component/user-card-component";
import { FriendsAction } from "../../redux/friends/friends-action";

const { Option } = Select;

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: "",
      sortBy: "modifiedDate",
    };

    this.filter = this.filter.bind(this);
    this.sort = this.sort.bind(this);
  }

  componentDidMount() {
    this.getFriends();
  }

  getFriends() {
    this.props.dispatch(
      FriendsAction.GetAddedStart(
        this.props.loggedUser._id,
        this.state.filter,
        this.state.sortBy,
      ),
    );
  }

  filter(event) {
    this.setState(
      {
        filter: event.target.value,
      },
      this.getFriends,
    );
  }

  sort(event) {
    this.setState(
      {
        sortBy: event,
      },
      this.getFriends,
    );
  }

  render() {
    return (
      <React.Fragment>
        <div className="friends-container">
          <div className="controls">
            <Input
              className="search-bar"
              // size="large"
              placeholder="Search friends"
              prefix={
                <ReactSVG className="search-icon" src="/img/icon_search.svg" />
              }
              onChange={debounce(this.filter, 300)}
            />
            <Select
              className="dropdown-bar ml-2"
              defaultValue={"Sorted by Ｍodified Date"}
              onChange={this.sort}
            >
              <Option value="modifiedDate">Sorted by Ｍodified Date</Option>
              <Option value="uploadDate">Sorted by Uploaded Date</Option>
            </Select>
            <div
              className="custom-button light"
              onClick={() => {
                this.setState({ uploadPoseModal: true, newPose: {} });
              }}
            >
              <ReactSVG className="button-icon" src="/img/icon_plus.svg" />
              <span>Add New Friends</span>
            </div>
          </div>

          <div className="friends">
            <Grid container spacing={2}>
              {this.props.added.map((user) => {
                return (
                  <UserCardComponent
                    key={user._id}
                    user={user}
                  ></UserCardComponent>
                );
              })}
            </Grid>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({
  loggedUser: store.LoginReducer.user,
  added: store.FriendsReducer.added,
}))(Router);

export const UserFriendsComponent = Redux;
