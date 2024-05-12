import React from "react";
import { connect } from "react-redux";
import { MainHeaderComponent } from "../../components/main-header-component/main-header-component";
import { MocapHeaderComponent } from "../../components/mocap-components/header-component/header-component";
import { Button, Table } from "antd";
import { RecordingActions } from "../../redux/recordings/recording-action";
import { ArrowLeftOutlined } from '@ant-design/icons';
class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    this.props.dispatch(RecordingActions.getRecordingFromCalibrationStart(this.props.match.params._id))
  }

  render() {
    return (
      <React.Fragment>
        <MocapHeaderComponent/>
        <div style={{padding: "25px"}}>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center" }}>
                <a onClick={()=>{this.props.history.push("/")}}>
                <ArrowLeftOutlined style={{fontSize: "18px", marginLeft: "5px"}}/>
                </a>
                <div style={{fontWeight: "bold", fontSize: "40px", paddingRight: "20px", paddingLeft: "20px"}}>
                    Recording
                </div>
                <Button type="primary" onClick={()=>{this.props.history.push("/recording/start/"+this.props.match.params._id)}}>
                    Add New Recording
                </Button>
            </div>
            <Table columns={[
                {
                    title: "_id",
                    dataIndex: "_id", 
                    key: "_id",
                    render: (_,{_id})=>(
                      <React.Fragment>
                        <a style={{color: "#0000EE"}}onClick={()=>{
                          this.props.history.push("/visualization/"+this.props.match.params._id + "/" + _id)
                        }}>{_id}</a>
                      </React.Fragment>
                    )
                },
                {
                    title: "Date",
                    dataIndex: "date",
                    key: "date",
                    render: (_,{date})=>(
                      <React.Fragment>
                        {date.toLocaleString('en-GB', { timeZone: 'Asia/Taipei' })}
                      </React.Fragment>
                    )
                },
                {
                  title: "Delete",
                  dataIndex: "_id",
                  key: "_id",
                  render: (_,{_id})=>(
                    <React.Fragment>
                      <Button danger onClick={()=>{
                        this.props.dispatch(RecordingActions.deleteRecordingStart(_id))
                      }}>
                        Delete
                      </Button>
                    </React.Fragment>
                  )
                }
            ]}
            dataSource={this.props.RecordingReducer.recordings}/>
            
        </div>
        

      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  user: store.LoginReducer.user,
  RecordingReducer: store.RecordingReducer
}))(Component);

export const RecordingHomePage = Redux;
