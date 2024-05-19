import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { connect } from "react-redux";
import { ErrorNotFoundComponent } from "../components/error-component/error-component";
import { ControlPage } from "./control-page/control-page";
import { FriendsPage } from "./friends-page/friends-page";
import { LoginPage } from "./login-page/login-page";
import { PoseVisualizationPage } from "./pose-visualization-page/pose-visualization-page";
import { SettingsPage } from "./settings-page/settings-page";
import { TeamsPage } from "./teams-page/teams-page";
import { LoginAction } from "../redux/login/login-action";
import { ProfilePage } from "./profile-page/profile-page";
import { PosesPage } from "./poses-page/poses-page";
import { PosePage } from "./pose-page/pose-page";
import { PoseAnalysisSelectionPage } from "./pose-analysis-selection-page/pose-analysis-selection-page";


import { StyleAction } from "../redux/style/style-action";
import "./general-style.scss";
import { CalibrationPage } from "./calibration-page/calibration-page";
import { CameraSetupPage } from "./camera-setup-page/camera-setup-page";
import { ThreeRenderingPage } from "./three-rendering-page/three-rendering-page";
import { CalibrationHomePage } from "./calibration-home-page/calibration-home-page";
import { RecordingHomePage } from "./recording-home-page/recording-home-page";
import { RecordingPage } from "./recording-page/recording-page";
// (/≧▽≦)/
import { batVisPage } from "./bat-vis-page/bat-vis-page";
import { pitchVisPage } from "./pitch-vis-page/pitch-vis-page";
import { baseballbvhPage } from "./baseballbvh-page/baseballbvh-page";



class Component extends React.Component {
  constructor(props) {
    super(props);
    window.addEventListener("resize", () => this.getWindowsHeight(), false);
  }

  // componentDidMount() {
  //   this.getWindowsHeight();

  //   if (!localStorage.getItem("accessToken")) return;
  //   this.props.dispatch(LoginAction.ValidateTokenStart());
  // }

  getWindowsHeight() {
    this.props.dispatch(StyleAction.Resize(document.body.clientHeight));
  }

  // render() {
  //   return (
  //     <Router>
  //       {(() => {
  //         if (this.props.login) {
  //           return (
  //             <Switch>
  //               <Route exact path="/" component={PosesPage} />
  //               {/* <Route exact path= "/calibration" component={CalibrationPage}/> */}
  //               <Route exact path="/poses" component={PosesPage} />
  //               <Route exact path="/poses/:pose_id" component={PosePage} />
  //               <Route
  //                 exact
  //                 path="/poses/:pose_id/new-analysis"
  //                 component={PoseAnalysisSelectionPage}
  //               />
  //               <Route
  //                 exact
  //                 path="/training_analysis/:analysis_id"
  //                 component={PoseVisualizationPage}
  //               />
  //               <Route exact path="/friends" component={FriendsPage} />
  //               <Route exact path="/teams" component={TeamsPage} />
  //               <Route exact path="/users/:username" component={ProfilePage} />
  //               <Route exact path="/login" component={PosesPage} />
  //               <Route exact path="/control" component={ControlPage} />
  //               <Route exact path="/settings" component={SettingsPage} />
  //               <Route component={ErrorNotFoundComponent} />
  //             </Switch>
  //           );
  //         } else {
  //           return (
  //             <Switch>
  //               <Route exact path= "/calibration" component={CalibrationPage}/>
  //               <Route exact path= "/recording/:_id" component={RecordingHomePage}/>
  //               <Route exact path= "/mocap" component={CameraSetupPage}/>
  //               <Route exact path= '/three' component={ThreeRenderingPage}/>
  //               <Route exact path= "/recording/start/:_id" component= {RecordingPage}/>
  //               <Route exact path="/visualization/:calibration_id/:recording_id" component={baseballbvhPage} />
  //               <Route path="/" component={CalibrationHomePage} />
  //             </Switch>
  //           );
  //         }
  //       })()}
  //     </Router>
  //   );
  // }
   render() {
    return (
      <Router>
        <Switch>
          <Route path="/baseballbvh-page" component={baseballbvhPage} />
          <Route path="/bat-vis-page" component={batVisPage} />
          <Route path="/pitch-vis-page" component={pitchVisPage} />
        </Switch>
      </Router>
    );
  }
}

const Redux = connect((store) => ({
  login: store.LoginReducer.login,
}))(Component);

export const Navigator = Redux;
