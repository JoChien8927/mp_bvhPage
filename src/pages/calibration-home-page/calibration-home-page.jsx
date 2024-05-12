import React from "react";
import { connect } from "react-redux";
import { MainHeaderComponent } from "../../components/main-header-component/main-header-component";
import { MocapHeaderComponent } from "../../components/mocap-components/header-component/header-component";
import { Button, Table } from "antd";
import { CalibrationAction } from "../../redux/calibration/calibration-action";

class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  getAllCalibrationsAPI(){
    this.props.dispatch(CalibrationAction.calibrationGetStart())
  }

  componentDidMount(){
    // this.getAllCalibrationsAPI.bind(this)
    this.props.dispatch(CalibrationAction.calibrationGetStart())
  }

  render() {
    return (
      <React.Fragment>
        <MocapHeaderComponent/>
        <div style={{padding: "25px"}}>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center" }}>
            <div style={{fontWeight: "bold", fontSize: "40px", paddingRight: "20px"}}>
                Calibration
            </div>
            <Button onClick={()=>{this.props.history.push("/calibration")}}> Add Calibration </Button>
          </div>
          {
            (()=>{
              console.log(this.props.calibrations)
            })()
          }
          <Table columns={[
            {
                title: "_id",
                dataIndex: "_id", 
                key: "_id",
                render: (_,{_id})=>(
                  <React.Fragment>
                    <a style={{color: "#0000EE"}}onClick={()=>{
                      this.props.history.push("/recording/"+_id)
                    }}>{_id}</a>
                  </React.Fragment>
                )
            },
            {
                title: "Date",
                dataIndex: "date",
                key: "date", //.toLocaleString('en-GB', { timeZone: 'Asia/Taipei' })
                // render: (_,{date})=>(
                //   <React.Fragment>
                //     {date.toLocaleString('en-GB', { timeZone: 'Asia/Taipei' })}
                //   </React.Fragment>
                // )
            },
            {
              title: "Delete",
              dataIndex: "_id",
              key: "_id",
              render: (_,{_id})=>(
                <React.Fragment>
                  <Button danger onClick={()=>{
                    console.log("clicked")
                    this.props.dispatch(CalibrationAction.calibrationDeleteStart(_id))
                  }}>
                    Delete
                  </Button>
                </React.Fragment>
              )
            }
          ]} dataSource={this.props.calibrations}/>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  user: store.LoginReducer.user,
  calibrations: store.CalibrationReducer.calibrations
}))(Component);

export const CalibrationHomePage = Redux;
