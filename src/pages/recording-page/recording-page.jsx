import React from "react";
import { connect } from "react-redux";
import { Progress, Button, Modal } from "antd";
import Webcam from "react-webcam";
import { MocapHeaderComponent } from "../../components/mocap-components/header-component/header-component";
import { StepGuideComponent } from "../../components/mocap-components/step-guide-component/step-guide-component";
import { CalibrationAction } from "../../redux/calibration/calibration-action";
import { RecordingActions } from "../../redux/recordings/recording-action";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        ref: [React.createRef(), React.createRef(), React.createRef(), React.createRef()],
        mediaRecorderRef: [React.createRef(), React.createRef(), React.createRef(), React.createRef()],
        recording: false,
        setRecordedChunks:[],
        recordedChunks: [[],[],[],[]],
        showConfirmation: false
    };
  }


  componentDidMount() {
    //this.getCameras()
    this.props.dispatch(CalibrationAction.calibrationIDStart(this.props.match.params._id))
  }

  componentDidUpdate(){
    if(this.props.RecordingReducer.recordingState === 2) this.props.dispatch(RecordingActions.recordConversionStart(this.props.match.params._id, this.props.RecordingReducer.recording._id, 1))
    else if(this.props.RecordingReducer.recordingState === 3)  this.props.dispatch(RecordingActions.poseEstimationStart(this.props.match.params._id, this.props.RecordingReducer.recording._id))
  }
//   handleDataAvailable(data){
//     if(data.size > 0){
//         this.setState({
//             recordedChunks: [...this.state.recordedChunks, data],
//         })
//     }
//   }

  handleStartCaptureClick(){
    this.state.mediaRecorderRef.map((mediaRecorderRef, key)=>{
        mediaRecorderRef.current = new MediaRecorder(this.state.ref[key].current.stream, {
            mimeType: "video/webm",
          });
    })
  }
  
  render() {
    return (
      <React.Fragment>
        <Modal 
          title="Pose Estimation" 
          closable={false}
          centered
          open={(()=>{
            if(this.props.recordingState !== 0) return true 
            else return false
          })()}
          footer={[
            <Button 
              type="primary" 
              danger 
              onClick={
                ()=>{
                  if(this.props.recordingState === 4) this.props.history.push("/visualization/"+this.props.match.params._id+"/"+this.props.RecordingReducer.recording._id)
                  else{
                    this.props.dispatch(RecordingActions.recordingErrorFinish())
                    this.setState({recording: false})}
                }
              }>
                {
                  (()=>{
                    if(this.props.recordingState === 4) return "View Result"
                    else return "Cancel"
                  })()
                }
            </Button>
          ]}
          >
            <Progress percent={this.props.recordingState/4*100} showInfo={false} status="active"/>
            {
              (()=>{
                if(this.props.recordingState ===1){
                  return(
                    <React.Fragment>
                      <span style={{display: "flex", alignItems: "center"}}>
                        <ClockCircleOutlined style={{color: "orange"}}/> &ensp; Video Uploading <br/>
                      </span>
                      <span style={{display: "flex", alignItems: "center"}}>
                        <ClockCircleOutlined style={{color: "orange"}}/> &ensp; Video Conversion <br/>
                      </span>
                      <span style={{display: "flex", alignItems: "center"}}>
                        <ClockCircleOutlined style={{color: "orange"}}/> &ensp; Human Pose Estimation
                      </span>
                    </React.Fragment>
                  )
                }
                else if(this.props.recordingState ===2){
                  return(
                    <React.Fragment>
                    <span style={{display: "flex", alignItems: "center"}}>
                      <CheckCircleOutlined style={{color: "green"}}/> &ensp; Video Upload successful <br/>
                    </span>
                    <span style={{display: "flex", alignItems: "center"}}>
                      <ClockCircleOutlined style={{color: "orange"}}/> &ensp; Running Video Conversion <br/>
                    </span>
                    <span>
                      <ClockCircleOutlined style={{color: "orange"}}/> &ensp; Human Pose Estimation <br/>
                    </span>
                  </React.Fragment>
                  )
                }
                else if(this.props.recordingState ===3){
                  return(
                    <React.Fragment>
                    <span style={{display: "flex", alignItems: "center"}}>
                      <CheckCircleOutlined style={{color: "green"}}/> &ensp; Video Upload successful <br/>
                    </span>
                    <span style={{display: "flex", alignItems: "center"}}>
                      <CheckCircleOutlined style={{color: "green"}}/> &ensp;  Video Conversion successful <br/>
                    </span>
                    <span>
                      <ClockCircleOutlined style={{color: "orange"}}/> &ensp; Running Human Pose Estimation <br/>
                    </span>
                  </React.Fragment>
                  )
                }
                else if(this.props.recordingState ===3){
                  return(
                    <React.Fragment>
                    <span style={{display: "flex", alignItems: "center"}}>
                      <CheckCircleOutlined style={{color: "green"}}/> &ensp; Video Upload successful <br/>
                    </span>
                    <span style={{display: "flex", alignItems: "center"}}>
                      <ClockCircleOutlined style={{color: "green"}}/> &ensp;  Video Conversion successful <br/>
                    </span>
                    <span>
                      <ClockCircleOutlined style={{color: "green"}}/> &ensp; Human Pose Estimation successful<br/>
                    </span>
                  </React.Fragment>
                  )
                }
                else if(this.props.recordingState === -1){
                  return(
                    <React.Fragment>
                      <p>{"3D Human Pose Estimation Failed"}</p>
                      <p>{"Reason: "+this.props.RecordingReducer.err}</p>
                    </React.Fragment>
                  )
                }
              })()
            }
        </Modal>
        <div className="CalibrationBody">
          <div className="CalibrationCameraBody">
            {
              (()=>{
                if(this.props.cams != []){
                  return(
                    <div className="CameraBody">
                        {this.props.cams.map((cam, key)=>{
                          return(
                            <div className="Camera">
                              <Webcam ref={this.state.ref[key]}  className="WebCam" audio={false} screenshotFormat="image/jpeg" minScreenshotWidth={1920} videoConstraints={{ deviceId: cam, height: 1080, width: 1920}} />
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
        <div style={{padding: "3px", display: "flex", alignItems: "center", flexGrow: 1, justifyContent: "center"}}>
            {/* <Button onClick={()=>{this.props.history.push("/")}}>Back</Button> */}
            {
              (()=>{
                return( 
                  <a 
                    onClick={()=>{
                      if(!this.state.recording){
                        this.state.mediaRecorderRef.map((mediaRecorderRef, key)=>{
                          if(this.state.ref[key].current !== null){
                              mediaRecorderRef.current = new MediaRecorder(this.state.ref[key].current.stream, {
                                  mimeType: "video/webm;codecs=vp9",
                                });
                                mediaRecorderRef.current.ondataavailable = (event)=>{                                  
                                  this.state.recordedChunks[key]= [...this.state.recordedChunks[key], event.data]
                                }
                          }
                          mediaRecorderRef.current.start(100);
                        })
                      }
                      else{
                        if(this.state.recordedChunks[0].length > 0){
                          this.state.mediaRecorderRef.map((mediaRecorderRef, key)=>{
                            if(this.state.ref[key].current !== null){
                              mediaRecorderRef.current.stop()
                            }
                        })
                        this.setState({showConfirmation: true})
                        }
                      }
                  //   if(!this.state.recording && this.state.recordedChunks[0].length > 0){
                  //     this.state.mediaRecorderRef.map((mediaRecorderRef, key)=>{
                  //         if(this.state.ref[key].current !== null){
                  //           mediaRecorderRef.current.stop()
                  //         }
                  //     })
                  //     this.setState({showConfirmation: true})
                  // }
                  // else {
                  //     this.state.mediaRecorderRef.map((mediaRecorderRef, key)=>{
                  //         if(this.state.ref[key].current !== null){
                  //             mediaRecorderRef.current = new MediaRecorder(this.state.ref[key].current.stream, {
                  //                 mimeType: "video/webm;codecs=vp9",
                  //               });
                  //               mediaRecorderRef.current.ondataavailable = (event)=>{
                  //                 this.state.recordedChunks[key]= [...this.state.recordedChunks[key], event.data]
                  //               }
                  //         }
                  //         mediaRecorderRef.current.start(100);
                  //     })
                  // }
                  this.setState({recording: !this.state.recording})

                  }}>
                    <img
                    className="recording-button"
                    src={(()=>{
                      if(this.state.recording) return process.env.PUBLIC_URL + "/img/pause_recording.svg"
                      else return process.env.PUBLIC_URL + "/img/start_recording.svg"
                    })()}
                  />
                  </a>
                )
              })()
            }
            {/* <Button 
                style={{marginLeft: "20px"}}
                onClick={()=>{this.setState({recording: !this.state.recording})}}>
                {
                    (()=>{
                        if(!this.state.recording ){
                            this.state.mediaRecorderRef.map((mediaRecorderRef, key)=>{
                                if(this.state.ref[key].current !== null){
                                  mediaRecorderRef.current.stop()
                                }
                            })
                            return "Record"

                        }
                        else {
                            this.state.mediaRecorderRef.map((mediaRecorderRef, key)=>{
                                if(this.state.ref[key].current !== null){
                                    mediaRecorderRef.current = new MediaRecorder(this.state.ref[key].current.stream, {
                                        mimeType: "video/webm;codecs=vp9",
                                      });
                                      mediaRecorderRef.current.ondataavailable = (event)=>{
                                        this.state.recordedChunks[key]= [...this.state.recordedChunks[key], event.data]
                                      }
                                }
                                mediaRecorderRef.current.start(100);
                            })

                            return "Stop"
                        }
                        
                    })()
                }
            </Button> */}
            <Button style={{marginLeft: "20px"}} onClick={()=>{
                // this.state.recordedChunks.map((recordedChunks, key)=>{
                //     console.log(recordedChunks)
                //     if(recordedChunks.length !== 0){
                //         const blob = new Blob(recordedChunks, {
                //             type: "video/webm",
                //           });
                //         const url = URL.createObjectURL(blob);
                //         const a = document.createElement("a");
                //         document.body.appendChild(a);
                //         a.style = "display: none";
                //         a.href = url;
                //         a.download = "react-webcam-stream-capture.webm";
                //         a.click();
                //         window.URL.revokeObjectURL(url);
                //         this.state.recordedChunks[key]= []
                //     }
                // })

                if(this.state.recordedChunks[0].length > 0){
                  let formData = new FormData();
                  this.state.recordedChunks.map((recordedChunks, key)=>{
                    console.log(key)
                    if(recordedChunks.length !== 0){
                      const blob = new Blob(recordedChunks, {
                        type: 'video/mp4',
                      });

                      console.log(recordedChunks)
                      let idx = key +1
                      let file = "video"+idx
                      let filename = idx + ".webm"
                      console.log(filename)
                      formData.append(file, blob, filename)
                    }
                  })
                  this.props.dispatch(RecordingActions.recordingUpload())
                  this.props.dispatch(RecordingActions.recordingStart(formData, this.props.match.params._id))
                  this.setState({recordedChunks: [[],[],[],[]]})
                }
            }}>
                Submit
            </Button>
        </div>
      </React.Fragment>
    );
  }
}

const Redux = connect((store) => ({
  LoginReducer: store.LoginReducer,
  cams: store.CalibrationReducer.cams,
  RecordingReducer: store.RecordingReducer,
  recordingState: store.RecordingReducer.recordingState
}))(Component);

export const RecordingPage = Redux;
