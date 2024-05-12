import React from "react";
import debounce from "lodash.debounce";

import "./user-poses-component.scss";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Input, Select } from "antd";
const { Option } = Select;

import Grid from "@material-ui/core/Grid";
import { ReactSVG } from "react-svg";
import { UserPoseComponent } from "./user-pose-component/user-pose-component";
import { UserNewPoseComponent } from "./user-new-pose-component/user-new-pose-component";
import { Translation } from "react-i18next";
import { TrainingPoseAction } from "../../redux/training-poses/training-poses-action";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadPoseModal: false,
      newPose: {},
      filter: "",
      sortBy: "modifiedDate",
    };

    this.filter = this.filter.bind(this);
    this.sort = this.sort.bind(this);
  }

  componentDidMount() {
    this.getPoses();
  }

  getPoses() {
    this.props.dispatch(
      TrainingPoseAction.TrainingPoseGetAllStart(
        this.props.userId,
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
      this.getPoses,
    );
  }

  sort(event) {
    this.setState(
      {
        sortBy: event,
      },
      this.getPoses,
    );
  }

  render() {
    return (
      <Translation>
        {(t, { i18n }) => (
          <React.Fragment>
            <div className="user-poses">
              <div className="controls">
                <Input
                  className="search-bar"
                  // size="large"
                  placeholder="Entering here to search files"
                  prefix={
                    <ReactSVG
                      className="search-icon"
                      src="/img/icon_search.svg"
                    />
                  }
                  onChange={debounce(this.filter, 300)}
                />
                <Select
                  className="dropdown-bar sorting"
                  defaultValue={"Sorted by Ｍodified Date"}
                  onChange={this.sort}
                >
                  <Option value="modifiedDate">Sorted by Ｍodified Date</Option>
                  <Option value="uploadDate">Sorted by Uploaded Date</Option>
                </Select>

                <UserNewPoseComponent />
              </div>

              <div className="poses">
                <Grid container spacing={2}>
                  {this.props.TrainingPoseReducer.trainingPoses.map((pose) => {
                    return (
                      <UserPoseComponent
                        key={pose._id}
                        pose={pose}
                      ></UserPoseComponent>
                    );
                  })}
                </Grid>
              </div>
            </div>
          </React.Fragment>
        )}
      </Translation>
    );
  }
}

const Router = withRouter(Component);

const Redux = connect((store) => ({
  StudentReducer: store.StudentReducer,
  TrainingPoseReducer: store.TrainingPoseReducer,
  processingVideoIds: store.TrainingPoseReducer.processingVideoIds,
}))(Router);

export const UserPosesComponent = Redux;
