import React from "react";
import { connect } from "react-redux";
import { MainHeaderComponent } from "../../components/main-header-component/main-header-component";
import { UserHeaderComponent } from "../../components/user-header-component/user-header-component";
import { UserPosesComponent } from "../../components/user-poses-component/user-poses-component";
import "./poses.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <MainHeaderComponent headerKey={0} />
        <UserHeaderComponent />
        <UserPosesComponent />
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({}))(Component);

export const PosesPage = Redux;
