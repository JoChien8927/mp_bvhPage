import React from "react";
import { Input } from "antd";
import debounce from "lodash.debounce";
import { connect } from "react-redux";
import { ReactSVG } from "react-svg";
import "./poses-available-component.scss";
import { PoseAnalysisSelectionAction } from "../../../redux/pose-analysis-selection/pose-analysis-selection-action";
import { PoseAvailable } from "./pose-available-component";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: "",
      sortBy: "modifiedDate",
    };

    this.filter = this.filter.bind(this);
  }

  componentDidMount() {
    this.getPoses();
  }

  getPoses() {
    this.props.dispatch(
      PoseAnalysisSelectionAction.GetAllPosesAvailableStart(this.state.filter),
    );
  }

  filter(event) {
    this.setState(
      {
        filter: event.target.value,
      },
      this.getPoses,
    );
  }

  render() {
    return (
      <React.Fragment>
        <div
          className="pose-analysis-selection"
          style={{
            height: this.props.style.posesAvailableVH,
            maxHeight: this.props.style.posesAvailableMaxVH,
          }}
        >
          <div className="filters">
            <Input
              className="search-bar"
              // size="large"
              placeholder="Search"
              prefix={
                <ReactSVG className="search-icon" src="/img/icon_search.svg" />
              }
              onChange={debounce(this.filter, 300)}
            />
            {/* <div className="filter-icon-wrapper">
              <ReactSVG className="filter-icon" src="/img/icon_filters.svg" />
            </div> */}
          </div>
          <div className="poses-available">
            {this.props.poses.map((pose) => {
              return <PoseAvailable key={pose._id} pose={pose}></PoseAvailable>;
            })}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  style: store.StyleReducer,
  poses: store.PoseAnalysisSelectionReducer.availablePoses,
}))(Component);

export const PosesAvailable = Redux;
