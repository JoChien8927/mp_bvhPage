import React from "react";
import { connect } from "react-redux";
import { MainHeaderComponent } from "../../components/main-header-component/main-header-component";
import { UserFriendsComponent } from "../../components/user-friends-component/user-friends-component";
import "./friends.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <MainHeaderComponent headerKey={1} />
        <UserFriendsComponent />
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  user: store.LoginReducer.user,
}))(Component);

export const FriendsPage = Redux;
