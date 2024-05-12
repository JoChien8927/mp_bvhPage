import React from "react";
import { connect } from "react-redux";
import { Dropdown, Button, Menu, Space} from "antd";
import Webcam from "react-webcam";
import { MocapHeaderComponent } from "../../components/mocap-components/header-component/header-component";
import { StepGuideComponent } from "../../components/mocap-components/step-guide-component/step-guide-component";
import { CameraOutlined, ConsoleSqlOutlined, DownOutlined, DribbbleCircleFilled } from "@ant-design/icons";
import {AR} from "../../components/js-aruco2/aruco.js"
import {CV} from "../../components/js-aruco2/cv.js"
import {POS} from "../../components/js-aruco2/posit1.js"


var modelSize = 1000; //millimeters

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        devices:[],
        displayCamera: null,
        selectedCamera: "1",
        selectedDevice: 0,
        currentStep: 0,
        detector: null,
        imageData: null,
        posit: null,
        translationx:0,
        translationy:0,
        translationz:0,
        yaw:0,
        pitch:0,
        raw:0,
        warpImage: null,
        homographyImage: null,
        // deviceOrder: [0,1,2,3],
        // selectedDevice: 0,
        canvasWrapRef: React.createRef(),
        canvasRef: React.createRef(),
        ref:[React.createRef(), React.createRef(), React.createRef(), React.createRef()]
    };
  }

  loadDetector(){
    let detector = new AR.Detector()
//    warpImage = context.createImageData(49, 49);
    let homographyImage = new CV.Image();
    this.setState({detector: detector, homographyImage: homographyImage})
  }

  getCameras(){
    navigator.mediaDevices.enumerateDevices().then((devices)=>{
      let alldevices= devices.filter((device, key)=>{
        if(device.kind === "videoinput"){
            return({key: device})
        }
    })
    this.setState({devices: alldevices})
    })
  }

  drawCorners(markers, context){
    var corners, corner, i, j;
  
    context.lineWidth = 3;

    for (i = 0; i !== markers.length; ++ i){
      corners = markers[i].corners;
      
      context.strokeStyle = "red";
      context.lineWidth = 10
      context.beginPath();
      
      for (j = 0; j !== corners.length; ++ j){
        corner = corners[j];
        context.moveTo(corner.x, corner.y);
        corner = corners[(j + 1) % corners.length];
        context.lineTo(corner.x, corner.y);
      }

      context.stroke();
      context.closePath();
      
      context.arc(corners[0].x, corners[0].y, 15, 0, 2 * Math.PI);
      context.fillStyle = "green"
      // context.strokeRect(corners[0].x - 20, corners[0].y - 20, 40, 40);
      context.fill()
    }
    
  }

  drawWarps(imageSrc, contours, x, y){

    var i = contours.length, j, contour;
    
    const canvas = this.state.canvasRef.current
    let context = canvas.getContext('2d')
    let warpImage = context.createImageData(49, 49);
    this.setState({warpImage: warpImage})
    var offset = ( canvas.width - ( (warpImage.width + 10) * contours.length) ) / 2

    if(contours.length > 0){
      contour = contours[0];
      console.log(warpImage)
      console.log(this.state.homographyImage)
      CV.warp(imageSrc, this.state.homographyImage, contour, warpImage.width);
      context.putImageData(this.createImage(this.state.homographyImage, warpImage), 0, 0);
      // CV.threshold(this.state.homographyImage, this.state.homographyImage, CV.otsu(this.state.homographyImage) );
      // contextWrap.putImageData(this.createImage(this.state.homographyImage, warpImage), 0, 0);
    }
    // while(i --){
    //   contour = contours[i];
    //   if(this.state.homographyImage !== null && warpImage!== null){
    //     CV.warp(imageSrc, this.state.homographyImage, contour, warpImage.width);
    //     context.putImageData(this.createImage(this.state.homographyImage, warpImage), offset + i * (warpImage.width + 10), y);
        
    //     // CV.threshold(this.state.homographyImage, this.state.homographyImage, CV.otsu(this.state.homographyImage) );
    //     // context.putImageData(this.createImage(this.state.homographyImage, this.state.warpImage),0,0);
    //   }

    // }
  }
  createImage(src, dst){
    var i = src.data.length, j = (i * 4) + 3;
    
    while(i --){
      dst.data[j -= 4] = 255;
      dst.data[j - 1] = dst.data[j - 2] = dst.data[j - 3] = src.data[i];
    }
    
    return dst;
  };

  tick(){
    requestAnimationFrame(()=>{
      this.tick()
    });
    if(this.state !== undefined){
      const video = this.state.ref[0].current;
      if (video !== null){
        if(video.readyState === video.HAVE_ENOUGH_DATA){
          const canvas = this.state.canvasRef.current;
          // canvas.width = video.video.videoWidth;
          // canvas.height = video.video.videoHeight;
          console.log(canvas.width)
          // let posit = new POS.Posit(modelSize, video.video.videoWidth);
          let posit = new POS.Posit(modelSize, video.video.videoWidth);
          let context = canvas.getContext('2d');
          this.snapshot();
          if(this.state.imageData !== null){
            var markers = this.state.detector.detect(this.state.imageData);
            this.drawCorners(markers, context);

            var corners, corner, pose, i;
      
            if (markers.length > 0){
              corners = markers[0].corners;
              
              for (i = 0; i < corners.length; ++ i){
                corner = corners[i];
                
                corner.x = corner.x - (canvas.width / 2);
                corner.y = (canvas.height / 2) - corner.y;
              }
              pose = posit.pose(corners);
              this.updatePose("pose1", pose.bestError, pose.bestRotation, pose.bestTranslation);
            }
            // this.drawWarps(this.state.detector.grey, this.state.detector.candidates,0, video.video.videoHeight * 2 + 20);
          }

        }

        // drawDebug();
        // drawCorners(markers);
        // drawId(markers);
      }
    }
    
  }

  updatePose(id, error, rotation, translation){
    var yaw = -Math.atan2(rotation[0][2], rotation[2][2]);
    var pitch = -Math.asin(-rotation[1][2]);
    var roll = Math.atan2(rotation[1][0], rotation[1][1]);
    console.log(rotation)
    console.log(translation)
    this.setState({translationx: (translation[0] | 0), translationy: (translation[1] | 0), translationz:(translation[2] | 0), yaw: Math.round(-yaw * 180.0/Math.PI), 
    pitch: Math.round(-pitch * 180.0/Math.PI), roll: Math.round(roll * 180.0/Math.PI)})
  };


  snapshot(){
    if(this.state !== undefined){
      const video = this.state.ref[0].current;
      const canvas = this.state.canvasRef.current;
      canvas.width = video.video.videoWidth;
      canvas.height = video.video.videoHeight;
      let context = canvas.getContext('2d');

      context.drawImage(video.video, 0, 0, canvas.width, canvas.height);

      try{
        let imageData = context.getImageData(0, 0, video.video.videoWidth, video.video.videoHeight);
        this.setState({imageData: imageData})
      }catch(err){
        console.log(err)
      }


    }
  }

  drawImge() {
    if(this.state !== undefined){
      const video = this.state.ref[0].current;
      const canvas = this.state.canvasRef.current;
      if (video && canvas) {
        let context = canvas.getContext('2d');
        canvas.width = video.video.videoWidth;
        canvas.height = video.video.videoHeight;
        requestAnimationFrame(this.tick());
      }
    }  
  }


  getItem(label, key, icon, children, type){
    return {
      key,
      icon,
      children,
      label,
      type,
    };
  }

  updateDevice(newDeviceNum){
    let newDeviceOrder = this.state.deviceOrder.map((d, key)=>{
      if(this.state.selectedDevice === key) return(newDeviceNum)
      else return d
    })
    this.setState({deviceOrder: newDeviceOrder}) 
  }

  componentDidMount() {
    this.loadDetector()
    this.getCameras()
    this.tick = this.tick.bind(this)
    this.drawImge = this.drawImge.bind(this)
    requestAnimationFrame(()=>{
      this.tick()
    })
  }

  render() {
    return (
      <React.Fragment>
        <MocapHeaderComponent/>
        <div className="CalibrationBody">
        {/* <StepGuideComponent refs={this.state.ref}/> */}
          <Menu
            style={{width: "50px"}}
            mode='inline'
            onSelect={(item)=>{
              this.setState({selectedCamera: item.key})
            }} 
            selectedKeys={this.state.selectedCamera}
            items={[
              this.getItem('1', '1'), 
              this.getItem('2', '2'), 
              this.getItem('3', '3'), 
              this.getItem('4', '4'), 
            ]}
            />
          <div style={{minWidth: "300px", backgroundColor: "white"}}>
            <div style={{paddingLeft: "24px", paddingTop: "10px", paddingBottom: "10px", fontWeight: "bold", fontSize: "16px"}}>
              Source {this.state.selectedCamera}
            </div>
            <Dropdown menu={{items: this.state.devices.map((device, key)=>{
                return({
                  label: (
                    <a onClick={()=>{
                      this.setState({displayCamera: device})
                    }}>
                      {device.label}
                    </a>
                  ),
                  key: key + 1
                })
              })}}
              trigger={['click']}>
              <a onClick={(e) => e.preventDefault()}>
                <span style={{display: "flex", paddingLeft: "24px", alignItems: "center", fontSize: "14px"}}> 
                  {
                    (()=>{
                      if(this.state.displayCamera !== null) return (this.state.displayCamera.label)
                      else return "None"
                    })()
                  } <DownOutlined style={{fontSize: "12px", marginLeft: "10px"}}/>
                </span>
              </a>
            </Dropdown>
            <div style={{margin: "24px", fontSize: "16px"}}>
                <b>Calibration Result</b> <br/>
                x: {this.state.translationx} <br/>
                y: {this.state.translationy}<br/>
                z: {this.state.translationz}<br/>
                yaw: {this.state.yaw}<br/>
                pitch: {this.state.pitch}<br/>
                roll: {this.state.roll}<br/>
            </div>
            <div style={{margin: "24px", fontSize: "16px"}}>
              <b>Wrap Result</b> 
              <canvas ref={this.state.canvasWrapRef} style={{height: "200px", width: "200px"}}/>
            </div>
          </div>
          <div className="CalibrationCameraBody">
            <div className="CameraBody">
            {
                (()=>{
                  if(this.state.devices.length > 0 && this.state.displayCamera !== null){
                    return(
                      <div className="CameraCalibration">
                        <Webcam mirrored ref={this.state.ref[0]}  className="WebCam" style={{width: "0%", height: "0%"}} audio={false} screenshotFormat="image/jpeg" minScreenshotWidth={1920} videoConstraints={{ deviceId: this.state.displayCamera.deviceId, height: 1080, width: 1920}} />
                        <canvas ref= {this.state.canvasRef} style={{width: "100%", height: "100%"}}/>
                      </div>
                    )
                  }
                })()
              }
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  LoginReducer: store.LoginReducer,
}))(Component);

export const CameraSetupPage = Redux;
