import React from "react";
import { connect } from "react-redux";
import { MainHeaderComponent } from "../../components/main-header-component/main-header-component";
import { UserPosesComponent } from "../../components/user-poses-component/user-poses-component";
import "./teams.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <MainHeaderComponent headerKey={2} />
        <UserPosesComponent />
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  user: store.LoginReducer.user,
}))(Component);

export const TeamsPage = Redux;
