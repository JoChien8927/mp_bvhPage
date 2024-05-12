import React from "react";
import { connect } from "react-redux";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileLocation: props.fileLocation,
    };
  }

  render() {
    return (
      <React.Fragment>
        <div className="thumbnailWrapper" style={{ width: 50 }}>
          <div
            className="thumbnailHovered"
            style={{
              backgroundColor: "rgba(0, 0, 0, 5)",
              backgroundImage: `url('${this.state.fileLocation}')`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
            }}
            alt=""
          ></div>
          <div
            className="thumbnail"
            style={{
              backgroundColor: "rgba(0, 0, 0, 5)",
              backgroundImage: `url('${this.state.fileLocation}')`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
            }}
            alt=""
          ></div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({}))(Component);

export const PoseVisualizationThumbnailImage = Redux;
