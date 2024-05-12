import React from "react";
import { connect } from "react-redux";
import { Dropdown, Button } from "antd";
import Webcam from "react-webcam";
import { MocapHeaderComponent } from "../../components/mocap-components/header-component/header-component";
import { StepGuideComponent } from "../../components/mocap-components/step-guide-component/step-guide-component";
import "./calibration-page.scss"

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        devices:[],
        currentStep: 0,
        deviceOrder: [0,1,2,3],
        selectedDevice: 0,
        ref:[React.createRef(), React.createRef(), React.createRef(), React.createRef()]
    };
  }

  getCameras(){
    navigator.mediaDevices.enumerateDevices().then((devices)=>{
      let alldevices= devices.filter((device, key)=>{
          if(device.kind === "videoinput" && device.label.includes("Logitech")){
              return({key: device})
          }
      })
      this.setState({devices: alldevices})
    })
  }

  updateDevice(newDeviceNum){
    let newDeviceOrder = this.state.deviceOrder.map((d, key)=>{
      if(this.state.selectedDevice === key) return(newDeviceNum)
      else return d
    })
    this.setState({deviceOrder: newDeviceOrder}) 
  }
  componentDidMount() {
    this.getCameras()
  }

  
  render() {
    const items = [
      {
        label: <a onClick={()=>{this.updateDevice(0)}}>Device: 1</a>,
        key: '0',
      },
      {
        label: <a onClick={()=>{this.updateDevice(1)}}>Device: 2</a>,
        key: '1',
      },
      {
        label: <a onClick={()=>{this.updateDevice(2)}}>Device: 3</a>,
        key: '2',
      },
      {
        label: <a onClick={()=>{this.updateDevice(3)}}>Device: 4</a>,
        key: '3',
      },
    ];
    return (
      <React.Fragment>
        <MocapHeaderComponent/>
        <div className="CalibrationBody">
          <StepGuideComponent refs={this.state.ref} deviceOrder= {this.state.deviceOrder} devices ={this.state.devices} history={this.props.history}/>
          <div className="CalibrationCameraBody">
            {
              (()=>{
                if(this.state.devices.length > 0){
                  return(
                    <div className="CameraBody">
                        {this.state.deviceOrder.map((order, key)=>{
                          return(
                            <div className="Camera">
                              <div style={{position: "absolute", top: 22, zIndex: 100}}>
                                <Dropdown menu={{items}} placement="bottom" onOpenChange={()=>{this.setState({selectedDevice: key})}}>
                                  <Button >
                                    Device: {order+1}
                                  </Button>
                                </Dropdown>
                              </div>
                              <Webcam ref={this.state.ref[order]}  className="WebCam" audio={false} screenshotFormat="image/jpeg" minScreenshotWidth={1920} videoConstraints={{ deviceId: this.state.devices[order].deviceId, height: 1080, width: 1920}} />
                            </div>
                          )
                        })}
                    </div>
                  )
                }
              })()
            }
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  LoginReducer: store.LoginReducer,
}))(Component);

export const CalibrationPage = Redux;
