import React from "react";
import { Button, Progress, Modal } from "antd";
import { connect } from "react-redux";
import "./step-guide-component.scss";
import { CalibrationAction } from "../../../redux/calibration/calibration-action";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";


class Component extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            currentStep: 0,
            stepsInfo: [
                {
                  title: "Camera Setup",
                  info: "Check if the cameras are working"
                },
                {
                  title: "Camera Calibration",
                  info: "Check if the QR code is in all cameras"
                },
                {
                  title: "3D Pose Visualization",
                  info: "Start 3D pose visualization"
                }
            ],
            calibrationModal: false
        }
    }

    componentDidMount(){

    }

    componentDidUpdate(){
      if(this.props.CalibrationReducer.status === 1){
        this.props.dispatch(CalibrationAction.calibrationPythonStart(this.props.CalibrationReducer.calibration._id))
      }
    }
    render(){
        return(
            <React.Fragment>
                <Modal 
                  title="Calibration" 
                  closable={false}
                  centered
                  open={this.state.calibrationModal}
                  footer={[
                    <Button 
                      type="primary" 
                      danger = {(()=>{
                        if(this.props.CalibrationReducer.status === 2) return false
                            else return true
                      })()}
                      onClick={
                        ()=>{
                          if(this.props.CalibrationReducer.status === 2) this.props.history.push("/recording/" + this.props.CalibrationReducer.calibration._id)
                          else return this.setState({calibrationModal: !this.state.calibrationModal})
                        }
                      }>
                        {
                          (()=>{
                            if(this.props.CalibrationReducer.status === 2) return "Success"
                            else return "Cancel"
                          })()
                        }
                    </Button>
                  ]}
                  >
                    <Progress percent={this.props.CalibrationReducer.status/2*100} showInfo={false} status="active"/>
                    {
                      (()=>{
                        if(this.props.CalibrationReducer.status === 1){
                          return(
                            <React.Fragment>
                              <span style={{display: "flex", alignItems: "center"}}>
                                <CheckCircleOutlined style={{color: "green"}}/> &ensp; Image Capture Successful <br/>
                              </span>
                              <span style={{display: "flex", alignItems: "center"}}>
                                <ClockCircleOutlined style={{color: "orange"}}/> &ensp; Running Camera Calibration ...
                              </span>
                            </React.Fragment>
                          )
                        }
                        else if(this.props.CalibrationReducer.status ===2){
                          return (
                            <React.Fragment>
                              <span style={{display: "flex", alignItems: "center"}}>
                                <CheckCircleOutlined style={{color: "green"}}/> &ensp; Image Capture Successful <br/>
                              </span>
                              <span style={{display: "flex", alignItems: "center"}}>
                                <ClockCircleOutlined style={{color: "green"}}/> &ensp; Calibration Success
                              </span>
                            </React.Fragment>
                          )
                        }
                      })()
                    }
                </Modal>
                <div className="StepGuideComponentContainer">
                    <h6>{this.state.stepsInfo[this.state.currentStep].title}</h6>
                    <Progress percent={this.state.currentStep/3*100} showInfo={false} status="active"/>
                    <h7>{this.state.currentStep}/3 Steps Complete</h7>
                    {
                        this.state.stepsInfo.map((stepInfo, key)=>{
                            return(
                                <React.Fragment key={key}> 
                                    <div className="StepInfoContainer">
                                        <Button shape="circle" type={(()=>{if(this.state.currentStep === key) return "primary"})()}>
                                            {key + 1}
                                        </Button>
                                        <span className="StepInfo">
                                            {stepInfo.info}
                                        </span>
                                    </div>
                                </React.Fragment>
                            )
                        })
                    }
                    {
                        (()=>{
                            if(this.state.currentStep === 0){
                                return(
                                    <React.Fragment>
                                        <div className="NextStepButtonContainer">
                                            <Button 
                                                type={"primary"} 
                                                size={"large"}
                                                onClick={()=>{
                                                    this.setState({currentStep: this.state.currentStep+1})
                                                }}>
                                                Next
                                            </Button>
                                        </div>
                                    </React.Fragment>
                                )
                            }
                            else{
                                return(
                                    <React.Fragment>
                                        <div className="StepButtonContainer">
                                            <Button 
                                                onClick={()=>{
                                                    this.setState({currentStep: 1, calibrationModal: !this.state.calibrationModal})
                                                    console.log(this.props.devices)
                                                    this.props.dispatch(
                                                    CalibrationAction.calibrationImageSendStart(this.props.deviceOrder.map((order)=>{return(this.props.devices[order].deviceId)}), 
                                                    this.props.refs[0].current.getScreenshot(),
                                                    this.props.refs[1].current.getScreenshot(),
                                                    this.props.refs[2].current.getScreenshot(),
                                                    this.props.refs[3].current.getScreenshot()))
                                                }}
                                                type={"primary"} size={"large"}> 
                                                Start Calibration!
                                            </Button>
                                        </div>
                                    </React.Fragment>
                                )
                            }
                        })()
                    }
                </div>
            </React.Fragment>
        )
    }
}

const Redux = connect((store) => ({
  CalibrationReducer: store.CalibrationReducer,
}))(Component);
  
export const StepGuideComponent = Redux;
