import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

import { batVisPage } from "./bat-vis-page/bat-vis-page";
import { pitchVisPage } from "./pitch-vis-page/pitch-vis-page";
import { baseballbvhPage } from "./baseballbvh-page/baseballbvh-page";

import { demoVisPage } from "./demo-vis-page/demo-vis-page";

class Component extends React.Component {
  constructor(props) {
    super(props);
    window.addEventListener("resize", () => this.getWindowsHeight(), false);
  }

  getWindowsHeight() {
    this.props.dispatch(StyleAction.Resize(document.body.clientHeight));
  }

  render() {
    return (
      <Router>
        <Routes>
          {/* 已登录用户的路由 */}
          {this.props.login ? (
            <>
              <Route path="/" element={<PosesPage />} />
              <Route path="/poses" element={<PosesPage />} />
              <Route path="/poses/:pose_id" element={<PosePage />} />
              <Route path="/poses/:pose_id/new-analysis" element={<PoseAnalysisSelectionPage />} />
              <Route path="/training_analysis/:analysis_id" element={<PoseVisualizationPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/users/:username" element={<ProfilePage />} />
              <Route path="/login" element={<PosesPage />} />
              <Route path="/control" element={<ControlPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<ErrorNotFoundComponent />} />
            </>
          ) : (
            <>
              {/* 未登录用户的路由 */}
              <Route path="/calibration" element={<CalibrationPage />} />
              <Route path="/recording/:_id" element={<RecordingHomePage />} />
              <Route path="/mocap" element={<CameraSetupPage />} />
              <Route path="/three" element={<ThreeRenderingPage />} />
              <Route path="/recording/start/:_id" element={<RecordingPage />} />
              <Route path="/visualization/:calibration_id/:recording_id" element={<baseballbvhPage />} />
              <Route path="/" element={<CalibrationHomePage />} />
            </>
          )}
          {/* 通用路由 */}
          <Route path="/baseballbvh-page/:exp/:num" element={<baseballbvhPage />} />
          {/* <Route path="/bat-vis-page" element={<batVisPage />} />
          <Route path="/pitch-vis-page" element={<pitchVisPage />} /> */}
          <Route path="/demo-vis-page/" element={<demoVisPage />} />
        </Routes>
      </Router>
    );
  }
}

const Redux = connect((store) => ({
  login: store.LoginReducer.login,
}))(Component);

export const Navigator = Redux;
