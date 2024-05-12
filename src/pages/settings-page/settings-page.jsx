import React from "react";
import { connect } from "react-redux";
import { MainHeaderComponent } from "../../components/main-header-component/main-header-component";
import { ListGroup } from "react-bootstrap";
import { Button, Transfer } from "antd";
import { StudentAction } from "../../redux/student/student-actions";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sideSelection: "Account",
      firstName: "",
      lastName: "",
      email: "",
      username: "",
    };
  }

  componentDidMount() {
    // if(this.props.LoginReducer.login === false){
    //     this.props.history.push("/");
    // }
    this.props.dispatch(StudentAction.FetchAllStudentStart());
    this.props.dispatch(
      StudentAction.FetchMyStudentStart(this.props.LoginReducer.user._id),
    );
    this.setState({
      firstName: this.props.LoginReducer.user.firstName,
      lastName: this.props.LoginReducer.user.lastName,
      username: this.props.LoginReducer.user.username,
      position: this.props.LoginReducer.user.position,
    });
  }

  render() {
    return (
      <React.Fragment>
        <MainHeaderComponent headerKey={1} />
        <div>
          <h1 style={{ textAlign: "center", paddingTop: "30px" }}>Settings</h1>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "95vw",
              paddingLeft: "5vw",
              paddingTop: "20px",
            }}
          >
            <div style={{ width: "10%", minWidth: "100px" }}>
              <ListGroup
                style={{ backgroundColor: "#f8f9fa", border: "none" }}
                activeKey={this.state.sideSelection}
              >
                {(() => {
                  if (this.state.sideSelection === "Account") {
                    return (
                      <ListGroup.Item
                        onClick={() => {
                          this.setState({ sideSelection: "Account" });
                        }}
                        eventKey={"Account"}
                        action
                      >
                        Account
                      </ListGroup.Item>
                    );
                  } else {
                    return (
                      <ListGroup.Item
                        style={{ backgroundColor: "#f8f9fa", border: "none" }}
                        onClick={() => {
                          this.setState({ sideSelection: "Account" });
                        }}
                        eventKey={"Account"}
                        action
                      >
                        Account
                      </ListGroup.Item>
                    );
                  }
                })()}
                {(() => {
                  if (this.state.position === "Teacher") {
                    if (this.state.sideSelection === "Students") {
                      return (
                        <ListGroup.Item
                          onClick={() => {
                            this.setState({ sideSelection: "Students" });
                          }}
                          eventKey={"Students"}
                          action
                        >
                          Students
                        </ListGroup.Item>
                      );
                    } else {
                      return (
                        <ListGroup.Item
                          style={{ backgroundColor: "#f8f9fa", border: "none" }}
                          onClick={() => {
                            this.setState({ sideSelection: "Students" });
                          }}
                          eventKey={"Students"}
                          action
                        >
                          Students
                        </ListGroup.Item>
                      );
                    }
                  }
                })()}
              </ListGroup>
            </div>
            <div
              style={{
                flexGrow: 1,
                marginLeft: "12px",
                background: "#FFFFFF 0% 0% no-repeat padding-box",
                boxShadow: " 0px 10px 25px #818181BE",
                borderRadius: "10px",
                minHeight: "40vh",
                padding: "20px",
                paddingLeft: "30px",
                marginBottom: "40px",
              }}
            >
              <h2>{this.state.sideSelection}</h2>
              {(() => {
                if (this.state.sideSelection === "Account") {
                  return (
                    <div style={{ marginTop: "30px", fontSize: "18x" }}>
                      <div style={{ fontSize: "20px" }}>
                        <b>User Information</b>
                      </div>
                      <div>
                        <div style={{ marginTop: "12px" }}>
                          <b>{"First Name: "}</b>
                          <span>{this.state.firstName}</span>
                        </div>
                        <div style={{ marginTop: "12px" }}>
                          <b>{"Last Name: "}</b>
                          <span>{this.state.lastName}</span>
                        </div>
                        <div style={{ marginTop: "12px" }}>
                          <b>{"Username: "}</b>
                          <span>{this.state.username}</span>
                        </div>
                        <div style={{ marginTop: "12px" }}>
                          <b>{"Position: "}</b>
                          <span>{this.state.position}</span>
                        </div>
                      </div>
                      <Button style={{ marginTop: "12px" }} disabled={true}>
                        Edit
                      </Button>
                    </div>
                  );
                } else if (this.state.sideSelection === "Students") {
                  return (
                    <div>
                      <Transfer
                        showSearch
                        listStyle={{
                          width: 300,
                          height: 300,
                        }}
                        dataSource={this.props.StudentReducer.student}
                        titles={["All students", "Your students"]}
                        targetKeys={this.props.StudentReducer.selected_student}
                        onChange={(targetKeys) => {
                          this.props.dispatch(
                            StudentAction.UpdateStudentStart(
                              this.props.LoginReducer.user._id,
                              targetKeys,
                            ),
                          );
                        }}
                        render={(item) => {
                          return item.firstName + " " + item.lastName;
                        }}
                      />
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  LoginReducer: store.LoginReducer,
  StudentReducer: store.StudentReducer,
}))(Component);

export const SettingsPage = Redux;
