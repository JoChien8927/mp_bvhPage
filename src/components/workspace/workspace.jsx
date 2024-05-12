  import React from "react";
import { connect } from "react-redux";
import { Store } from "../../redux/store";
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader.js";

// import CanvasDraw from "react-canvas-draw";
import { Viewer } from "./view/viewer.js";
import Playback from "./ctrl/playback";
import { AnglesActions } from "../../redux/angles/angles-action";
import { ActionRecordingActions } from "../../redux/action-recording/action-recording-action";
import { PoseVisualizationFooterActionRecordingWrapper } from "../../pages/pose-visualization-page/pose-visualization-annotation/pose-visualization-footer/pose-visualization-footer-action-recording-wrapper";

import { currentActionRecording$ } from "../../redux/action-recording/action-recording-action";
import { Actions } from "../../redux/action-recording/action";
import { forEach } from "mathjs";
import { WorkspaceMenuActions } from "../../redux/workspace-menu/workspace-menu-action";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.mode = this.props.mode;
    this.subMenuOpen = this.props.subMenuOpen;
    this.recordingBarOpen = this.props.recordingBarOpen;
    this.drawOptions = this.props.drawOptions;
    this.laserOptions = this.props.laserOptions;
    this.angleOptions = this.props.angleOptions;
    this.chartUnderGeneration = this.props.chartUnderGeneration;
    this.trajectoryOptions = this.props.trajectoryOptions;

    this.state = {
      playbackIsPlay: false,
      playbackIsLoop: false,
      playbackSpeed: 1,
      playbackMaxValue: 0,
      playbackCurFrame: [0, 0, 0],
      playbackBadValue: [],
      playbackBadColor: [],

      accuracy: {
        good: 0,
        neutral: 0,
        bad: 0,
      },
    };

    this.element = undefined;

    WorkspaceMenuActions.WorkspaceLoad();
    AnglesActions.anglesLoad();
  }

  handleChange() {
    this.handleOpenCloseChanged();
    this.handleSceneModeChanged();
    this.handleWorkspaceSpaceSizeChanged();

    this.handleActivateInactivateDrawingRequested();
    this.handleBrushSizeChanged();
    this.handleActivateInactivateEraserRequested();
    this.handleColorChanged();
    this.handleActivateUndoRequested();
    this.handleActivateRedoRequested();
    this.handleClearDrawRequested();

    this.handleAnglesChanged();
    this.handleAngleChartGenerationRequested();

    this.handleTrajectoryChangeRequested();
  }

  handleOpenCloseChanged() {
    let previousValue = this.menuOpened;
    const menuOpened = Store.getState().WorkspaceMenuReducer.subMenuOpen;

    if (previousValue !== menuOpened) {
      this.menuOpened = menuOpened;
      this.viewer.render();
    }
  }

  handleSceneModeChanged() {
    let previousValue = this.mode.sceneMode;
    this.mode.sceneMode = Store.getState().WorkspaceMenuReducer.mode.sceneMode;

    if (previousValue !== this.mode.sceneMode) {
      this.viewer.updateScene(this.mode.sceneMode);
    }
  }

  handleClearDrawRequested() {
    let previousValue = this.drawOptions.lastTimeClear;
    this.drawOptions.lastTimeClear =
      Store.getState().WorkspaceMenuReducer.drawOptions.lastTimeClear;

    if (previousValue !== this.drawOptions.lastTimeClear) {
      this.clearDraw();
    }
  }

  handleColorChanged() {
    let previousValue = this.drawOptions.brushColor;
    this.drawOptions.brushColor =
      Store.getState().WorkspaceMenuReducer.drawOptions.brushColor;

    if (previousValue !== this.drawOptions.brushColor) {
      this.changeDrawColor(this.drawOptions.brushColor);
    }
  }

  handleBrushSizeChanged() {
    let previousValue = this.drawOptions.brushRadius;
    this.drawOptions.brushRadius =
      Store.getState().WorkspaceMenuReducer.drawOptions.brushRadius;

    if (previousValue !== this.drawOptions.brushRadius) {
      this.changeDrawBrushSize(this.drawOptions.brushRadius);
    }
  }

  handleActivateInactivateDrawingRequested() {
    let previousValue = this.drawOptions.show;
    this.drawOptions.show =
      Store.getState().WorkspaceMenuReducer.drawOptions.show;

    if (previousValue !== this.drawOptions.show) {
      this.activateInactivateDraw(this.drawOptions.show);
    }
  }

  handleActivateInactivateEraserRequested() {
    let previousValue = this.drawOptions.drawPencilActive;
    this.drawOptions.drawPencilActive =
      Store.getState().WorkspaceMenuReducer.drawOptions.drawPencilActive;

    if (previousValue !== this.drawOptions.drawPencilActive) {
      this.activateInactivateEraserDraw(!this.drawOptions.drawPencilActive);
    }
  }

  handleActivateUndoRequested() {
    let previousValue = this.drawOptions.lastTimeUndo;
    this.drawOptions.lastTimeUndo =
      Store.getState().WorkspaceMenuReducer.drawOptions.lastTimeUndo;

    if (previousValue !== this.drawOptions.lastTimeUndo) {
      this.activateUndoDraw();
    }
  }

  handleActivateRedoRequested() {
    let previousValue = this.drawOptions.lastTimeRedo;
    this.drawOptions.lastTimeRedo =
      Store.getState().WorkspaceMenuReducer.drawOptions.lastTimeRedo;

    if (previousValue !== this.drawOptions.lastTimeRedo) {
      this.activateRedoDraw();
    }
  }

  handleTrajectoryChangeRequested() {
    let previousValue = this.trajectoryOptions;
    this.trajectoryOptions =
      Store.getState().WorkspaceMenuReducer.trajectoryOptions;

    if (!this.areObjectsEqual(previousValue, this.trajectoryOptions)) {
      this.updateTrajectory();
    }
  }

  handleAnglesChanged() {
    let previousAngleOptions = this.angleOptions;
    this.angleOptions = Store.getState().WorkspaceMenuReducer.angleOptions;

    if (previousAngleOptions.show && !this.angleOptions.show) {
      this.deleteAllAngles();
      return;
    }

    if (!this.angleOptions.show) {
      return;
    }

    if (this.props.sessionSourceType == "mediapipe") {
      this.handleMediaPipeAnglesChanged(previousAngleOptions);
    } else {
      this.handleIMUAnglesChanged(previousAngleOptions);
    }
  }

  handleIMUAnglesChanged(previousAngleOptions) {
    //rightUpperArm
    if (
      (!previousAngleOptions.rightUpperArm || !previousAngleOptions.show) &&
      this.angleOptions.rightUpperArm
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "RightArm",
        "RightShoulder",
        "RightForeArm",
      );
    }

    if (
      previousAngleOptions.rightUpperArm &&
      !this.angleOptions.rightUpperArm
    ) {
      this.deleteAngle("RightArm, RightShoulder, RightForeArm");
    }

    //rightMiddleArm
    if (
      (!previousAngleOptions.rightMiddleArm || !previousAngleOptions.show) &&
      this.angleOptions.rightMiddleArm
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "RightForeArm",
        "RightArm",
        "RightHand",
      );
    }

    if (
      previousAngleOptions.rightMiddleArm &&
      !this.angleOptions.rightMiddleArm
    ) {
      this.deleteAngle("RightForeArm, RightArm, RightHand");
    }

    //rightUpperLeg
    if (
      (!previousAngleOptions.rightUpperLeg || !previousAngleOptions.show) &&
      this.angleOptions.rightUpperLeg
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "RightUpLeg",
        "Hips",
        "RightLeg",
      );
    }

    if (
      previousAngleOptions.rightUpperLeg &&
      !this.angleOptions.rightUpperLeg
    ) {
      this.deleteAngle("RightUpLeg, Hips, RightLeg");
    }

    //rightMiddleLeg
    if (
      (!previousAngleOptions.rightMiddleLeg || !previousAngleOptions.show) &&
      this.angleOptions.rightMiddleLeg
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "RightLeg",
        "RightUpLeg",
        "RightFoot",
      );
    }

    if (
      previousAngleOptions.rightMiddleLeg &&
      !this.angleOptions.rightMiddleLeg
    ) {
      this.deleteAngle("RightLeg, RightUpLeg, RightFoot");
    }

    //leftUpperArm
    if (
      (!previousAngleOptions.leftUpperArm || !previousAngleOptions.show) &&
      this.angleOptions.leftUpperArm
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "LeftArm",
        "LeftShoulder",
        "LeftForeArm",
      );
    }

    if (previousAngleOptions.leftUpperArm && !this.angleOptions.leftUpperArm) {
      this.deleteAngle("LeftArm, LeftShoulder, LeftForeArm");
    }

    //leftMiddleArm
    if (
      (!previousAngleOptions.leftMiddleArm || !previousAngleOptions.show) &&
      this.angleOptions.leftMiddleArm
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "LeftForeArm",
        "LeftArm",
        "LeftHand",
      );
    }

    if (
      previousAngleOptions.leftMiddleArm &&
      !this.angleOptions.leftMiddleArm
    ) {
      this.deleteAngle("LeftForeArm, LeftArm, LeftHand");
    }

    //leftUpperLeg
    if (
      (!previousAngleOptions.leftUpperLeg || !previousAngleOptions.show) &&
      this.angleOptions.leftUpperLeg
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "LeftUpLeg",
        "Hips",
        "LeftLeg",
      );
    }

    if (previousAngleOptions.leftUpperLeg && !this.angleOptions.leftUpperLeg) {
      this.deleteAngle("LeftUpLeg, Hips, LeftLeg");
    }

    //leftMiddleLeg
    if (
      (!previousAngleOptions.leftMiddleLeg || !previousAngleOptions.show) &&
      this.angleOptions.leftMiddleLeg
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "LeftLeg",
        "LeftUpLeg",
        "LeftFoot",
      );
    }

    if (
      previousAngleOptions.leftMiddleLeg &&
      !this.angleOptions.leftMiddleLeg
    ) {
      this.deleteAngle("LeftLeg, LeftUpLeg, LeftFoot");
    }
  }

  handleMediaPipeAnglesChanged(previousAngleOptions) {
    //rightUpperArm
    if (
      (!previousAngleOptions.rightUpperArm || !previousAngleOptions.show) &&
      this.angleOptions.rightUpperArm
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "RightShoulder",
        "MidShoulder",
        "RightElbow",
      );
    }

    if (
      previousAngleOptions.rightUpperArm &&
      !this.angleOptions.rightUpperArm
    ) {
      this.deleteAngle("RightShoulder, MidShoulder, RightElbow");
    }

    //rightMiddleArm
    if (
      (!previousAngleOptions.rightMiddleArm || !previousAngleOptions.show) &&
      this.angleOptions.rightMiddleArm
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "RightElbow",
        "RightShoulder",
        "RightWrist",
      );
    }

    if (
      previousAngleOptions.rightMiddleArm &&
      !this.angleOptions.rightMiddleArm
    ) {
      this.deleteAngle("RightElbow, RightShoulder, RightWrist");
    }

    //rightUpperLeg
    if (
      (!previousAngleOptions.rightUpperLeg || !previousAngleOptions.show) &&
      this.angleOptions.rightUpperLeg
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "RightHip",
        "MidHip",
        "RightKnee",
      );
    }

    if (
      previousAngleOptions.rightUpperLeg &&
      !this.angleOptions.rightUpperLeg
    ) {
      this.deleteAngle("RightHip, MidHip, RightKnee");
    }

    //rightMiddleLeg
    if (
      (!previousAngleOptions.rightMiddleLeg || !previousAngleOptions.show) &&
      this.angleOptions.rightMiddleLeg
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "RightKnee",
        "RightHip",
        "RightAnkle",
      );
    }

    if (
      previousAngleOptions.rightMiddleLeg &&
      !this.angleOptions.rightMiddleLeg
    ) {
      this.deleteAngle("RightKnee, RightHip, RightAnkle");
    }

    //leftUpperArm
    if (
      (!previousAngleOptions.leftUpperArm || !previousAngleOptions.show) &&
      this.angleOptions.leftUpperArm
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "LeftShoulder",
        "MidShoulder",
        "LeftElbow",
      );
    }

    if (previousAngleOptions.leftUpperArm && !this.angleOptions.leftUpperArm) {
      this.deleteAngle("LeftShoulder, MidShoulder, LeftElbow");
    }

    //leftMiddleArm
    if (
      (!previousAngleOptions.leftMiddleArm || !previousAngleOptions.show) &&
      this.angleOptions.leftMiddleArm
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "LeftElbow",
        "LeftShoulder",
        "LeftWrist",
      );
    }

    if (
      previousAngleOptions.leftMiddleArm &&
      !this.angleOptions.leftMiddleArm
    ) {
      this.deleteAngle("LeftElbow, LeftShoulder, LeftWrist");
    }

    //leftUpperLeg
    if (
      (!previousAngleOptions.leftUpperLeg || !previousAngleOptions.show) &&
      this.angleOptions.leftUpperLeg
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "LeftHip",
        "MidHip",
        "LeftKnee",
      );
    }

    if (previousAngleOptions.leftUpperLeg && !this.angleOptions.leftUpperLeg) {
      this.deleteAngle("LeftHip, MidHip, LeftKnee");
    }

    //leftMiddleLeg
    if (
      (!previousAngleOptions.leftMiddleLeg || !previousAngleOptions.show) &&
      this.angleOptions.leftMiddleLeg
    ) {
      this.viewer.generateAngleBasedOnPredefinedJoints(
        "LeftKnee",
        "LeftHip",
        "LeftAnkle",
      );
    }

    if (
      previousAngleOptions.leftMiddleLeg &&
      !this.angleOptions.leftMiddleLeg
    ) {
      this.deleteAngle("LeftKnee, LeftHip, LeftAnkle");
    }
  }

  handleAngleChartGenerationRequested() {
    let previousValue = this.chartUnderGeneration;
    this.chartUnderGeneration =
      Store.getState().AnglesReducer.chartUnderGeneration;

    if (
      previousValue !== this.chartUnderGeneration &&
      this.chartUnderGeneration
    ) {
      this.generateAngleGraphic();
    }
  }

  handleWorkspaceSpaceSizeChanged() {
    this.subMenuOpen = Store.getState().WorkspaceMenuReducer.subMenuOpen;
    this.recordingBarOpen = Store.getState().RecordingReducer.show;
  }

  areObjectsEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (let key of keys1) {
      if (object1[key] !== object2[key]) {
        return false;
      }
    }
    return true;
  }

  getImages() {
    const videos = [];

    this.props.poses.forEach((pose) => {
      videos.push(this.getImage(pose.index, pose.pose));
    });

    return videos;
  }

  getImage(index, pose) {
    const imgs = [];
    const initialPosition = this.props.mode.sceneMode == 0 ? "85%" : "50%";
    const rightPosition = index ? "0" : initialPosition;

    const basePath = `/api/files/mediapipe-
    /${pose._id}/`;

    for (let i = 0; i < this.state.playbackCurFrame[2]; i++) {
      const imgFrame = this.state.playbackDtwMapping[i][index];

      imgs.push(
        <img
          key={i}
          width={"100%"}
          style={{
            display: this.state.playbackCurFrame[1] == i ? "block" : "none",
          }}
          src={
            basePath + "image-" + imgFrame.toString().padStart(5, "0") + ".jpeg"
          }
        ></img>,
      );
    }

    return (
      <div
        key={`video-${pose._id}`}
        style={{
          overflow: "hidden",
          position: "absolute",
          bottom: "0px",
          maxWidth: "10%",
          right: rightPosition,
        }}
      >
        {imgs}
      </div>
    );
  }

  // videoRef = (index, player) => {
  //   this.videoPlayers[index] = player;
  // };

  // getVideos() {
  //   const videos = [];

  //   this.props.poses.forEach((pose) => {
  //     videos.push(this.getVideo(pose.index, pose.pose));
  //   });

  //   return videos;
  // }

  // getVideo(index, pose) {
  //   const initialPosition = this.props.mode.sceneMode == 0 ? "85%" : "50%";
  //   const rightPosition = index ? "0" : initialPosition;
  //   const videoUrl = `${process.env.PUBLIC_URL}/api/files/mediapipe-pose/${pose._id}/processed.mp4`;

  //   return (
  //     <div
  //       key={`video-${pose._id}`}
  //       style={{
  //         overflow: "hidden",
  //         position: "absolute",
  //         bottom: "0px",
  //         maxWidth: "15%",
  //         right: rightPosition,
  //       }}
  //     >
  //       <video
  //         muted
  //         preload="auto"
  //         ref={(player) => this.videoRef(index, player)}
  //         id={pose._id}
  //         width="100%"
  //         src={videoUrl}
  //       />
  //     </div>
  //   );
  // }

  strokeErased(mouse) {
    ActionRecordingActions.StoreEraseStroke(mouse);
  }

  strokeMade(points, drawingLocation) {
    if (points.length > 1)
      ActionRecordingActions.StoreDrawStroke(points, drawingLocation);
  }

  laserStrokeMade(canvas, stroke) {
    if (stroke.paths.length > 1) canvas.clearCanvas();
  }

  getCameraPosition() {
    return this.viewer.getCameraPosition();
  }

  getScreenshot() {
    return this.viewer.getScreenshot();
  }

  render() {
    return (
      <React.Fragment>
        <div className="workspace-wrapper">
          <div
            className="workspace"
            style={{
              height: this.props.actionRecordings.show
                ? this.props.style.canvasWithRecordingVH
                : this.props.style.canvasWithoutRecordingVH,
              maxHeight: this.props.actionRecordings.show
                ? this.props.style.canvasWithRecordingMaxVH
                : this.props.style.canvasWithoutRecordingMaxVH,
            }}
          >
            <div
              className="workspace-threejs"
              ref={(element) => (this.element = element)}
            >
              <div
                className={`workspace-player-divider ${
                  this.props.mode.sceneMode ? "active" : ""
                }`}
              ></div>
            </div>
            {this.getImages()}
          </div>
          <Playback
            playbackIsPlay={this.state.playbackIsPlay}
            playbackSpeed={this.state.playbackSpeed}
            playbackCurFrame={this.state.playbackCurFrame}
            playbackMaxValue={this.state.playbackMaxValue}
            playbackIsLoop={this.state.playbackIsLoop}
            accuracy={this.state.accuracy}
            updateSpeed={this.updateSpeed.bind(this)}
            playBackInterval={this.playBackInterval.bind(this)}
            playPauseScene={this.playPauseScene.bind(this)}
            updateLoopMode={this.updateLoopMode.bind(this)}
            updateFramPosFromSlider={this.updateFramPosFromSlider.bind(this)}
          />
          <PoseVisualizationFooterActionRecordingWrapper
            getCameraPosition={this.getCameraPosition.bind(this)}
            getScreenshot={this.getScreenshot.bind(this)}
            camera={this.viewer?.camera}
          />

          {/* <PoseVisualizationFooterWrapper /> */}
        </div>
      </React.Fragment>
    );
  }

  startSubscribers() {
    Store.subscribe(() => this.handleChange());
    currentActionRecording$.subscribe((data) => {
      switch (data.action) {
        case Actions.threeJS.drawing.stroke:
          this.viewer.drawLineFromPoints(
            data.options.points,
            true,
            data.options.drawingLocation,
          );
          break;
        case Actions.threeJS.drawing.erase:
          this.viewer.eraseLineFromMouse(data.options.mouse);
          break;
        case Actions.threeJS.camera.position_changed:
          this.viewer.updateCameraPosition(
            data.options.cameraPosition,
            data.options.cameraRotation,
          );
          break;
        case Actions.player.play_pause:
          this.playPauseScene(data.options.isPlay);
          break;
        case Actions.player.update_frame:
          this.updateFramePos(data.options.frame);
          break;
        case Actions.player.speed:
          this.updateSpeed(data.options.speed);
          break;
        case Actions.player.loop:
          this.updateLoopMode();
          break;
      }
    });
  }

  componentDidMount() {
    const rawsLoaded = [];
    const trajectorySize = 4;

    this.props.poses.forEach((pose) => {
      for (let index = 0; index < trajectorySize; index++) {
        rawsLoaded.push(
          this.load(
            new BVHLoader(),
            `/api/files/bvh-pose/${pose.pose.poseIMUFile}`,
          ),
        );
      }
    });

    Promise.all(rawsLoaded).then((raws) => {
      const viewer = (this.viewer = new Viewer(
        {
          container: this.element,
          raws: raws,
          sessionSourceType: this.props.sessionSourceType,
          amountOfPoses: this.props.poses.length,
          trajectorySize: trajectorySize,
        },
        {
          createAngle: this.createAngleFromView.bind(this),
          updateAngle: this.updateAngleFromView.bind(this),
          strokeMadeCallBack: this.strokeMade.bind(this),
          strokeErasedCallback: this.strokeErased.bind(this),
        },
      ));

      this.element.appendChild(viewer.renderer.domElement);

      const max =
        raws[(this.props.poses.length - 1) * trajectorySize].clip.tracks[0]
          .times.length;
      const bad = viewer.dtwSolvers[0].poseColorPosArray;
      const color = viewer.dtwSolvers[0].poseColorValueArray;
      const dtwMapping = viewer.dtwSolvers[0].posterizedPath;

      this.setAccuracy(
        viewer.dtwSolvers[0].countGood,
        viewer.dtwSolvers[0].countNeutral,
        viewer.dtwSolvers[0].countBad,
      );

      this.setState({
        playbackMaxValue: max,
        playbackCurFrame: [0, 0, max],
        playbackDtwMapping: dtwMapping,
        playbackBadValue: bad,
        playbackBadColor: color,
      });

      viewer.init(0, this.props.mode.sceneMode, this.props.mode.cameraMode);

      this.initPlayBackInterval();
      this.startSubscribers();
    });
  }

  initPlayBackInterval() {
    this.fps = this.props.poses[0].frameRate || 30;
    var speed = 1000.0 / (this.fps * this.state.playbackSpeed);

    clearInterval(this.interval);

    this.interval = setInterval(this.playBackInterval.bind(this), speed);
  }

  load(loader, url) {
    return new Promise((resolve) => {
      loader.load(url, resolve);
    });
  }

  updateCameraMode(mode) {
    this.setState(
      { mode: { ...this.props.mode, cameraMode: mode } },
      this.viewer.updateCamera(mode),
    );
  }

  updateSpeed(speed) {
    this.setState(
      {
        playbackSpeed: speed,
      },
      this.initPlayBackInterval,
    );

    ActionRecordingActions.StorePlayerSpeed(speed);
  }

  playPauseScene(playbackIsPlay) {
    this.setState({
      playbackIsPlay: playbackIsPlay,
    });

    const currentFrame = this.state.playbackCurFrame;
    if (currentFrame[1] == currentFrame[2] && this.state.playbackIsPlay) {
      currentFrame[1] = 0;

      this.updateFramePos(currentFrame);
    }

    ActionRecordingActions.StorePlayerPlayPause(playbackIsPlay);
  }

  updateLoopMode() {
    this.setState({
      playbackIsLoop: !this.state.playbackIsLoop,
    });

    ActionRecordingActions.StorePlayerLoop();
  }

  playBackInterval(increase = 1, playActionNeeded = true) {
    if (this.props.actionRecordings.playbackActive) return;
    if (this.state.playbackIsPlay || !playActionNeeded) {
      const newFrame = this.state.playbackCurFrame;
      newFrame[1] =
        newFrame[1] + increase < 0 || newFrame[1] + increase > newFrame[2]
          ? 0
          : newFrame[1] + increase;
      this.updateFramePos(newFrame);
    }
  }

  updateFramPosFromSlider(frameNumber) {
    const newFrame = this.state.playbackCurFrame;
    newFrame[1] = frameNumber;
    this.updateFramePos(newFrame);
  }

  updateFramePos(frame) {
    if (frame)
      this.setState(
        {
          playbackCurFrame: frame,
          playbackIsPlay:
            this.state.playbackIsPlay &&
            (this.state.playbackIsLoop || frame[1] != frame[2]),
        },
        this.viewer.updateModel(frame[1]),
      );

    ActionRecordingActions.StorePlayerUpdateFrame(frame);
  }

  setAccuracy(good, neutral, bad) {
    this.setState({
      accuracy: {
        ...this.state.accuracy,
        good: good,
        neutral: neutral,
        bad: bad,
      },
    });
  }

  activateInactivateDraw(drawActive) {
    this.viewer.drawActive = drawActive;
  }

  changeDrawBrushSize(drawLineWidth) {
    this.viewer.drawLineWidth = drawLineWidth;
  }

  changeDrawColor(drawColor) {
    this.viewer.drawColor = drawColor;
  }

  activateInactivateEraserDraw(eraserActive) {
    this.viewer.eraserActive = eraserActive;
  }

  activateUndoDraw() {
    this.viewer.undoDraw();
  }

  activateRedoDraw() {
    this.viewer.redoDraw();
  }

  clearDraw() {
    this.viewer.clearDraw();
  }

  updateMode(mode) {
    this.viewer.updateMode(mode);

    this.setState({
      mode: { ...mode },
    });
  }

  updateTrajectory() {
    this.viewer.updateTrajectory(
      this.trajectoryOptions.show,
      this.trajectoryOptions.length,
      this.trajectoryOptions.density,
      this.trajectoryOptions.head,
      this.trajectoryOptions.spine,
      this.trajectoryOptions.rightShoulder,
      this.trajectoryOptions.rightArm,
      this.trajectoryOptions.rightHand,
      this.trajectoryOptions.leftShoulder,
      this.trajectoryOptions.leftArm,
      this.trajectoryOptions.leftHand,
      this.trajectoryOptions.hips,
      this.trajectoryOptions.rightLeg,
      this.trajectoryOptions.leftLeg,
    );
  }

  zoomIn() {
    this.viewer.zoomIn();
  }

  zoomOut() {
    this.viewer.zoomOut();
  }

  deleteAllAngles() {
    if (this.viewer) {
      this.viewer.deleteAllAngles();
    }
    this.props.dispatch(AnglesActions.anglesDeleteAll());
  }

  deleteAngle(name) {
    if (this.viewer) {
      this.viewer.deleteAngle(name);
    }
    this.props.dispatch(AnglesActions.anglesDelete(name));
  }

  createAngleFromView(newAngle) {
    if (this.props.anglesDetails.find((x) => x.name == newAngle.name)) return;

    this.props.dispatch(AnglesActions.anglesAdd(newAngle.name));
  }

  updateAngleFromView(angleUpdate, isStudentAngle) {
    if (this.chartUnderGeneration) {
      if (
        !this.props.anglesDetails.find(
          (angle) => angle.name == angleUpdate.name,
        )
      ) {
        this.props.anglesDetails.push({
          name: angleUpdate.name,
          student: [],
          ref: [],
        });
      }

      if (isStudentAngle) {
        this.props.anglesDetails
          .find((angle) => angle.name == angleUpdate.name)
          .student.push(angleUpdate.angle);
      } else {
        this.props.anglesDetails
          .find((angle) => angle.name == angleUpdate.name)
          .ref.push(angleUpdate.angle);
      }
    }
  }

  generateAngleGraphic() {
    const currentFrame = this.state.playbackCurFrame[1];
    for (
      let index = 0;
      index < this.state.playbackMaxValue;
      index += this.fps
    ) {
      this.updateFramPosFromSlider(index);
    }

    this.props.dispatch(AnglesActions.anglesGenerateChartFinished());

    this.updateFramPosFromSlider(currentFrame);
  }
}

export const Workspace = connect((store) => ({
  recordingBarOpen: store.RecordingReducer.show,
  subMenuOpen: store.WorkspaceMenuReducer.subMenuOpen,
  mode: store.WorkspaceMenuReducer.mode,
  drawOptions: store.WorkspaceMenuReducer.drawOptions,
  laserOptions: store.WorkspaceMenuReducer.laserOptions,
  trajectoryOptions: store.WorkspaceMenuReducer.trajectoryOptions,
  angleOptions: store.WorkspaceMenuReducer.angleOptions,
  anglesDetails: store.AnglesReducer.anglesDetails,
  chartUnderGeneration: store.AnglesReducer.chartUnderGeneration,
  actionRecordings: store.ActionRecordingReducer,
  style: store.StyleReducer,
}))(Component);
