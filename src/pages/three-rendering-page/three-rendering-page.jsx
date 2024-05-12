import React from "react";
import { connect } from "react-redux";
import { Viewer } from "./viewer";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state= {
      element: null,
    }
  }

  componentDidMount(){
  }

  componentDidUpdate(){

  }
  render() {
    return (
      <React.Fragment>
        {/* <div ref={(element) => (this.element = element)}/> */}
        <div style={{width: "100vw", height: "100vh"}}>
          <Viewer/>
        </div>
        

      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  user: store.LoginReducer.user,
}))(Component);

export const ThreeRenderingPage = Redux;
