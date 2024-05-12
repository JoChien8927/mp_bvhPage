import React from "react";
import { connect } from "react-redux";
import { UserPosesComponent } from "../../../components/user-poses-component/user-poses-component";
import "./friend-feed-component.scss";

class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={"feed-content"}>
        <UserPosesComponent />
      </div>
    );
  }
}

const Redux = connect((store) => ({}))(Component);

export default Redux;
