import React from "react";
import { connect } from "react-redux";
import { MainHeaderComponent } from "../../components/main-header-component/main-header-component";
import { UserHeaderComponent } from "../../components/user-header-component/user-header-component";
import { UserPosesComponent } from "../../components/user-poses-component/user-poses-component";
import { TrainingPoseAction } from "../../redux/training-poses/training-poses-action";
import "./index.scss";

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

const Redux = connect((store) => ({
  user: store.LoginReducer.user,
}))(Component);

export const IndexPage = Redux;
