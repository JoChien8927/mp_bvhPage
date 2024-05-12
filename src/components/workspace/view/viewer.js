import * as THREE from "three/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CCDIKSolver } from "three/examples/jsm/animation/CCDIKSolver";
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "three.meshline";
import { OutlinePass } from "./OutlinePass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import Stats from "three/examples/jsm/libs/stats.module";

import { EDWSolver, DTWSolver } from "./solver";
import { JointHelper, LimbHelper, AngleHelper } from "./helper";
import { forEach } from "mathjs";

class Viewer {
  constructor(
    { container, raws, sessionSourceType, amountOfPoses, trajectorySize },
    { createAngle, updateAngle, strokeMadeCallBack, strokeErasedCallback },
  ) {
    // this.stats = Stats();
    this.trajectorySize = trajectorySize;
    // document.body.appendChild(this.stats.dom);

    // raws
    const poses = (this.poses = []);
    for (let index = 0; index < amountOfPoses; index++) {
      poses.push(
        raws.slice(
          index * this.trajectorySize,
          index * this.trajectorySize + this.trajectorySize,
        ),
      );
    }

    // renderer
    const renderer = (this.renderer = new Renderer());
    this.createAngle = createAngle;
    this.updateAngle = updateAngle;
    this.strokeMadeCallBack = strokeMadeCallBack;
    this.strokeErasedCallback = strokeErasedCallback;

    // camera
    const camera = (this.camera = new Camera({}));

    // orbit
    const orbit = (this.orbit = new OrbitControls(
      camera,
      this.renderer.domElement,
    ));

    orbit.enable = true;
    orbit.maxDistance = 800;
    orbit.minDistance = 50;

    this.mouse = new THREE.Vector2();

    // scene
    this.lapScene = new Scene();
    this.refScene = new Scene();
    this.cmpScene = new Scene();
    this.splittedScenes = [this.refScene, this.cmpScene];

    // composer
    this.composer = new EffectComposer(renderer);
    this.raycaster = new THREE.Raycaster();

    this.refJointColor = 0x262626;
    this.refLimbColor = 0x7c8b8f;
    this.refAngleColor = 0x3d4547;
    this.cmpJointColor = 0x262626;
    this.cmpLimbColor = 0x0978ac;
    this.cmpAngleColor = 0x043c56;

    const models = (this.models = this.poses.map((pose, poseIndex) =>
      pose.map(
        (p, pIndex) =>
          new Model({
            opacity: 1 - pIndex * 0.25,
            jointColor: poseIndex ? this.cmpJointColor : this.refJointColor,
            limbColor: poseIndex ? this.cmpLimbColor : this.refLimbColor,
            angleColor: poseIndex ? this.cmpAngleColor : this.refAngleColor,
            pose: p,
            skin: undefined,
            racket: undefined,
            updateAngle: this.updateAngle,
            isStudent: poseIndex ? true : false,
            sessionSourceType: sessionSourceType,
            offset: pIndex,
          }),
      ),
    ));

    this.outlines = this.poses.map((pose, poseIndex) =>
      pose.map((p) =>
        this.getOutlinePass(
          this.splittedScenes[poseIndex],
          poseIndex ? this.cmpJointColor : this.refJointColor,
        ),
      ),
    );

    // solver
    this.edwSolvers = [];
    this.dtwSolvers = [];
    for (let index = 0; index < this.trajectorySize; index++) {
      this.edwSolvers.push(
        new EDWSolver({ ref: models[0][index], cmp: models[1][index] }),
      );

      this.dtwSolvers.push(
        new DTWSolver({ ref: models[0][index], cmp: models[1][index] }),
      );
    }
    // this.edwSolver = new EDWSolver({ ref: models[0][0], cmp: models[1][0] });
    // this.edwSolver1 = new EDWSolver({ ref: models[0][1], cmp: models[1][1] });
    // this.edwSolver2 = new EDWSolver({ ref: models[0][2], cmp: models[1][2] });

    // this.dtwSolver = new DTWSolver({ ref: models[0][0], cmp: models[1][0] });
    // this.dtwSolver1 = new DTWSolver({ ref: models[0][1], cmp: models[1][1] });
    // this.dtwSolver2 = new DTWSolver({ ref: models[0][2], cmp: models[1][2] });

    this.renderPass = new RenderPass();

    // Do not change these two addPasses order!
    this.composer.addPass(this.renderPass);

    this.container = container;
    this.containerWidth = container.clientWidth;
    this.containerHeight = container.clientHeight;
    this.curSceneMode = 0;
    this.curCameraMode = 0;

    this.renderer.domElement.addEventListener(
      "pointerdown",
      (event) => this.pointerDown(event),
      false,
    );

    this.renderer.domElement.addEventListener(
      "pointermove",
      (event) => this.pointerMove(event),
      false,
    );

    this.renderer.domElement.addEventListener(
      "pointerup",
      (event) => this.finishLine(),
      false,
    );

    orbit.addEventListener("change", () => {
      this.updateRenderer(this.curSceneMode, camera);
    });

    orbit.addEventListener(
      "change",
      () => this.updateRenderer(this.curSceneMode, camera),
      false,
    );

    window.addEventListener("resize", () => this.render(), false);

    this.initShadow();
    this.start = Date.now();
    this.render = this.render.bind(this);
    this.drawingActions = [];
    this.drawingActionsUndo = [];
  }

  getScreenshot() {
    const strDownloadMime = "image/octet-stream";
    var imgData;

    try {
      var strMime = "image/jpeg";
      imgData = this.renderer.domElement.toDataURL(strMime);
      return imgData.replace(strMime, strDownloadMime);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  zoomOut() {
    this.camera.fov = this.camera.fov + 5;
    this.camera.updateProjectionMatrix();
    this.updateCamera(this.cameraMode);
    this.updateRenderer(this.sceneMode, this.camera);
  }

  zoomIn() {
    this.camera.fov = this.camera.fov - 5;
    this.camera.updateProjectionMatrix();
    this.updateCamera(this.cameraMode);
    this.updateRenderer(this.sceneMode, this.camera);
  }

  getOutlinePass(scene, angleColor) {
    return new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      scene,
      this.camera,
      [],
      [],
      new THREE.Color(255, 255, 255),
      angleColor,
      2,
    );
  }

  init(frame, sceneMode, cameraMode) {
    this.updateModel(frame);
    this.updateScene(sceneMode);
    this.updateCamera(cameraMode);
    this.updateCameraPosition(this.camera.position, this.camera.rotation);
  }

  getCameraPosition() {
    return {
      position: this.camera.position,
      rotation: this.camera.rotation,
    };
  }

  initShadow() {
    this.lapScene.addShadow();
    this.refScene.addShadow();
    this.cmpScene.addShadow();
  }

  updateMode(mode) {
    this.updateScene(mode.sceneMode);
    this.updateCamera(mode.cameraMode);
    this.updateRenderer(this.curSceneMode, this.camera);
  }

  updateTrajectory(show) {
    this.models.forEach((model) => {
      model.forEach((m, mIndex) => {
        if (mIndex && !show) m.visible = false;
        else m.visible = true;
      });
    });
    this.updateRenderer(this.curSceneMode, this.camera);
  }

  updateModel(frame) {
    this.frame = frame;
    this.models.forEach((model, index) => {
      model.forEach((m, mIndex) => {
        const newFrame = mIndex ? frame - mIndex * 10 : frame;
        m.update(newFrame > 0 ? newFrame : 0);
      });
    });

    this.updateRenderer(this.curSceneMode, this.camera);
  }

  deleteAllAngles() {
    this.models.forEach((model) => {
      model.forEach((m) => {
        m.deleteAllAngles();
      });
    });
    this.updateRenderer(this.curSceneMode, this.camera);
  }

  deleteAngle(name) {
    this.models.forEach((model) => {
      model.forEach((m) => {
        m.deleteAngle(name);
      });
    });
    this.updateRenderer(this.curSceneMode, this.camera);
  }

  updateCameraPosition(cameraPosition, cameraRotation) {
    this.camera.position.set(
      cameraPosition.x,
      cameraPosition.y,
      cameraPosition.z,
    );

    this.camera.rotation.set(
      cameraRotation._x,
      cameraRotation._y,
      cameraRotation._z,
    );
    this.updateRenderer(this.curSceneMode, this.camera);
  }

  updateScene(sceneMode) {
    const container = this.container;
    const lapScene = this.lapScene;
    const refScene = this.refScene;
    const cmpScene = this.cmpScene;

    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.composer.setSize(container.clientWidth, container.clientHeight);
    this.curSceneMode = sceneMode;

    if (sceneMode === 0) {
      this.models.forEach((model) => {
        model.forEach((m, mIndex) => {
          if (mIndex) m.visible = false;
          else m.visible = true;

          lapScene.update(m);
        });
      });

      lapScene.visible = true;
      refScene.visible = false;
      cmpScene.visible = false;
    } else if (sceneMode === 1) {
      this.models.forEach((model, sceneIndex) => {
        model.forEach((m, mIndex) => {
          if (mIndex) m.visible = false;
          else m.visible = true;

          this.splittedScenes[sceneIndex].update(m);
        });
      });

      lapScene.visible = false;
      refScene.visible = true;
      cmpScene.visible = true;
    }

    this.updateCamera(this.curCameraMode);
    this.updateRenderer(sceneMode, this.camera);
  }

  initCCDIKSolver() {
    const cmpModel = this.cmpModel;
    const scene = this.curSceneMode ? this.cmpScene : this.lapScene;

    // Move right Hand
    const effector = 7;
    const target = 27;
    const links = [{ index: 6 }, { index: 5 }];

    const targetPosition = new THREE.Vector3(0, 0, 0);
    cmpModel.skeleton.bones[effector].getWorldPosition(targetPosition);

    const targetBone = new THREE.Bone();
    targetBone.name = "target";
    targetBone.position.y = targetPosition.y;
    targetBone.position.x = targetPosition.x;
    targetBone.position.z = targetPosition.z;

    if (this.ikSolver) {
      cmpModel.skeleton.bones.pop();
      cmpModel.skeleton.bones[0].children.pop();
    }

    cmpModel.skeleton.bones[0].attach(targetBone);
    cmpModel.skeleton.bones.push(targetBone);

    const geometry = new THREE.SphereGeometry(1);
    var material = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0 });

    this.mesh = this.mesh || new THREE.SkinnedMesh(geometry, material);
    this.mesh.add(cmpModel.skeleton.bones[0]); // "root" bone
    this.mesh.bind(cmpModel.skeleton);

    scene.update(this.mesh);

    const iks = [
      {
        target: target,
        effector: effector,
        links: links,
      },
    ];

    this.ikSolver = new CCDIKSolver(this.mesh, iks);
  }

  render() {
    if (this.resizeRendererToDisplaySize()) {
      this.updateCamera(this.curCameraMode);
      this.updateRenderer(this.curSceneMode, this.camera);
    }
    requestAnimationFrame(this.render);
  }

  resizeRendererToDisplaySize() {
    // queue request for next frame
    const container = this.container;
    const needResize =
      container.clientHeight !== this.containerHeight ||
      container.clientWidth !== this.containerWidth;
    if (needResize) {
      this.containerWidth = container.clientWidth;
      this.containerHeight = container.clientHeight;
      this.renderer.setSize(this.containerWidth, this.containerHeight);
      this.composer.setSize(this.containerWidth, this.containerHeight);
    }
    return needResize;
  }

  updateCamera(cameraMode) {
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvasAspect = this.containerWidth / this.containerHeight;
    const sceneAspect =
      this.curSceneMode === 0 ? canvasAspect : canvasAspect / 2;

    this.curCameraMode = cameraMode;

    this.camera.update(sceneAspect, cameraMode);
    this.orbit.update();

    this.updateRenderer(this.curSceneMode, this.camera);
  }

  getXYPositions = (clientX, clientY) => {
    const mouse = this.mouse;
    const { left, right, top, bottom } =
      this.renderer.domElement.getBoundingClientRect();

    const width = right - left;
    const height = bottom - top;
    clientX = clientX - left;

    if (this.curSceneMode === 0) {
      mouse.x = (clientX / width) * 2 - 1;
    } else if (clientX > width / 2) {
      mouse.x = ((clientX / width) * 2 - 1.5) * 2;
    } else {
      mouse.x = ((clientX / width) * 2 - 0.5) * 2;
    }

    mouse.y = -((clientY - top) / height) * 2 + 1;

    return {
      x: mouse.x,
      y: mouse.y,
      side: clientX > width / 2 ? "right" : "left",
    };
  };

  getObjectsMatch(mouse, scene) {
    const camera = this.camera;

    // create a Raycaster object
    const raycaster = new THREE.Raycaster();

    // set the origin of the raycaster to the camera position
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster
      .intersectObjects(scene.children, true)
      .filter((x) => x.object.name == "Drawn Line");

    return intersects;
  }

  getLinePoint(event) {
    const camera = this.camera;
    const mouse = this.getXYPositions(event.clientX, event.clientY);

    // create a Raycaster object
    const raycaster = new THREE.Raycaster();

    // set the origin of the raycaster to the camera position
    raycaster.setFromCamera(mouse, camera);

    // get the intersection point with the camera-facing plane
    const cameraDirection = raycaster.ray.direction.clone();
    const plane = new THREE.Plane(cameraDirection.negate(), 0);

    // check for intersection with plane
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectionPoint);

    return intersectionPoint;
  }

  pointerMove(event) {
    if (this.eraserActive) this.eraseLine(event, false);
    else this.drawLine(event, false);
  }

  pointerDown(event) {
    if (
      (event.pointerType === "stylus" ||
        event.pointerType === "pen" ||
        event.pointerType === "mouse") &&
      this.drawActive
    ) {
      this.orbit.enabled = false;
      if (this.eraserActive) this.eraseLine(event, true);
      else this.drawLine(event, true);
    } else {
      this.finishLine();
    }
  }

  drawLineFromPoints(points, isNew, location) {
    points = points.map(
      (point) => new THREE.Vector3(point.x, point.y, point.z),
    );

    if (!isNew && this.currentMeshLine) {
      this.currentMeshLine.setPoints(points.flat());
    } else {
      const meshLine = new MeshLine();
      meshLine.setPoints(points.flat());

      let material = new MeshLineMaterial({
        color: new THREE.Color(this.drawColor || "#000000"),
        lineWidth: this.drawLineWidth || 2,
        side: THREE.DoubleSide,
      });

      let mesh = new THREE.Mesh(meshLine.geometry, material);
      mesh.raycast = MeshLineRaycast;
      mesh.name = "Drawn Line";

      switch (location) {
        case "lap":
          this.lapScene.add(mesh);
          break;
        case "cmp":
          this.cmpScene.add(mesh);
          break;
        case "ref":
          this.refScene.add(mesh);
          break;
      }

      this.currentLine = mesh;
      this.currentMeshLine = meshLine;
    }
    this.updateRenderer(this.curSceneMode, this.camera);
  }

  eraseLine(event) {
    if (!event.pressure || !this.drawActive) return;
    const mouse = this.getXYPositions(event.clientX, event.clientY);
    this.eraseLineFromMouse(mouse);
  }

  eraseLineFromMouse(mouse) {
    let scene = null;

    if (this.curSceneMode == 0) {
      scene = this.lapScene;
    } else if (mouse.side == "right") {
      scene = this.cmpScene;
    } else {
      scene = this.refScene;
    }

    const objects = this.getObjectsMatch(mouse, scene);

    if (objects.length) {
      this.strokeErasedCallback(mouse);

      objects.forEach((object) => {
        if (object.object.visible) {
          this.drawingActions.push({
            action: "erase",
            object: object.object,
          });
          this.drawingActionsUndo = [];
          object.object.visible = false;
        }
      });

      this.updateRenderer(this.curSceneMode, this.camera);
    }
  }

  drawLine(event, isNew) {
    if (!event.pressure || !this.drawActive) return;

    const mouse = this.getXYPositions(event.clientX, event.clientY);
    const point = this.getLinePoint(event);
    let scene = null;

    this.points = this.points || [];
    this.points.push(point);

    let currentLocation = "";
    if (this.curSceneMode == 0) {
      currentLocation = "lap";
    } else if (mouse.side == "right") {
      currentLocation = "cmp";
    } else {
      currentLocation = "ref";
    }

    if (!isNew && currentLocation != this.drawingLocation) {
      isNew = true;
      this.finishLine(false);
    }
    this.drawingLocation = currentLocation;

    this.drawLineFromPoints(this.points, isNew, this.drawingLocation);
  }

  finishLine(enableOrbit = true) {
    if (this.points?.length) {
      this.drawingActions.push({
        action: "draw",
        object: this.currentLine,
      });
      this.drawingActionsUndo = [];
      this.strokeMadeCallBack(this.points, this.drawingLocation);
    }

    this.currentMeshLine = null;
    this.points = [];
    this.orbit.enabled = enableOrbit;
  }

  clearDraw() {
    var items = [];
    if (this.curSceneMode) {
      this.cmpScene.children = this.cmpScene.children.map((child) => {
        if (child.name === "Drawn Line" && child.visible) {
          child.visible = false;
          items.push(child);
        }
        return child;
      });
      this.refScene.children = this.refScene.children.map((child) => {
        if (child.name === "Drawn Line" && child.visible) {
          child.visible = false;
          items.push(child);
        }
        return child;
      });
    } else {
      this.lapScene.children = this.lapScene.children.map((child) => {
        if (child.name === "Drawn Line" && child.visible) {
          child.visible = false;
          items.push(child);
        }
        return child;
      });
    }

    this.drawingActions.push({ action: "clear", objects: items });

    this.updateRenderer(this.curSceneMode, this.camera);
  }

  undoDraw() {
    var lastAction = this.drawingActions.pop();
    if (lastAction) {
      this.drawingActionsUndo.push(lastAction);
      switch (lastAction.action) {
        case "draw":
          lastAction.object.visible = false;
          break;

        case "erase":
          lastAction.object.visible = true;
          break;

        case "clear":
          lastAction.objects.map((object) => (object.visible = true));
          break;
      }
      this.updateRenderer(this.curSceneMode, this.camera);
    }
  }

  redoDraw() {
    var nextAction = this.drawingActionsUndo.pop();
    if (nextAction) {
      this.drawingActions.push(nextAction);
      switch (nextAction.action) {
        case "draw":
          nextAction.object.visible = true;
          break;

        case "erase":
          nextAction.object.visible = false;
          break;

        case "clear":
          nextAction.objects.map((object) => (object.visible = false));
          break;
      }
      this.updateRenderer(this.curSceneMode, this.camera);
    }
  }

  generateAngleBasedOnPredefinedJoints(
    originJointName,
    directionJointName1,
    directionJointName2,
  ) {
    this.outlines.forEach((outline, index) => {
      outline.forEach((o, oIndex) => {
        o.selectedObjects = new Array();
        o.selectedObjects.push(
          this.models[index][oIndex].jointHelper.joints.find(
            (joint) => originJointName == joint.name,
          ),
        );

        o.selectedObjects.push(
          this.models[index][oIndex].jointHelper.joints.find(
            (joint) => directionJointName1 == joint.name,
          ),
        );

        o.selectedObjects.push(
          this.models[index][oIndex].jointHelper.joints.find(
            (joint) => directionJointName2 == joint.name,
          ),
        );
      });
    });

    this.generateAngleBasedOnSelections();
    this.updateRenderer(this.curSceneMode, this.camera);
  }

  generateAngleBasedOnSelections() {
    const angles = this.outlines.map((outline, index) =>
      outline.map((o, oIndex) => {
        const joints = o.getJointsSelected();

        const angle = this.models[index][oIndex].angleHelper.setArrows(
          joints.originJoint,
          joints.directionJoint1,
          joints.directionJoint2,
        );

        return angle;
      }),
    );

    this.createAngle({
      name: angles[0][0].name,
      angles: angles.map((x) => x[0]).map((x) => x.angle),
    });
  }

  updateRenderer(sceneMode, camera) {
    this.models.forEach((model) => {
      model.forEach((m) => {
        m.updateAngles();
      });
    });

    if (sceneMode === 0) {
      this.renderer.update(0, this.containerWidth, this.containerHeight);
      this.updateComposer(this.lapScene, camera);
    } else if (sceneMode === 1) {
      this.renderer.update(0, this.containerWidth / 2, this.containerHeight);
      this.updateComposer(this.refScene, camera);

      this.renderer.update(
        this.containerWidth / 2,
        this.containerWidth / 2,
        this.containerHeight,
      );
      this.updateComposer(this.cmpScene, camera);
    }

    // this.stats.update();
  }

  updateComposer(scene, camera) {
    this.renderPass.scene = scene;
    this.renderPass.camera = camera;

    this.composer.render();
    this.renderer.render(scene, camera);
  }
}

class Renderer extends THREE.WebGLRenderer {
  constructor() {
    super({ preserveDrawingBuffer: true });

    this.autoClear = false;
    this.setScissorTest(true);
  }

  update(left, width, height) {
    this.setScissor(left, 0, width, height);
    this.setViewport(left, 0, width, height);
  }
}

class Camera extends THREE.PerspectiveCamera {
  constructor({ fov, aspect, near, far }) {
    super(fov, aspect, near, far);
    this.position.set(0, 0, -400);
  }

  update(aspect, mode) {
    const position = this.position;

    if (mode === 1) position.set(0, 100, -300);
    if (mode === 2) position.set(0, 100, 300);
    if (mode === 3) position.set(300, 100, 0);
    if (mode === 4) position.set(-300, 100, 0);
    if (mode === 5) position.set(0, 300, 0);

    this.aspect = aspect;

    this.updateProjectionMatrix();
  }
}

class Scene extends THREE.Scene {
  constructor() {
    super();

    this.background = new THREE.Color(0xf8fdff);
  }

  update(model) {
    this.add(model);
    this.visible = true;
  }

  addShadow() {
    const hemiLight = new THREE.AmbientLight(0x636363, 1);
    hemiLight.position.set(0, 200, 0);
    this.add(hemiLight);

    // Plane
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    const texture = new THREE.TextureLoader().load("/api/files/grid8.png");
    const planeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      map: texture,
      opacity: 0.9,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    const planeEuler = new THREE.Euler(-0.785398 * 2, 0, 0.785398 * 2, "XYZ");
    plane.setRotationFromEuler(planeEuler);
    plane.receiveShadow = false;
    plane.position.set(0, -180, 0);
    this.add(plane);

    // Directional Light to show shadow
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-150, 200, -200);
    light.castShadow = true;
    this.add(light);

    // Set up shadow properties for the light
    light.shadow.mapSize.width = 1000; // default
    light.shadow.mapSize.height = 1000; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 5000; // default
    light.shadow.camera.left = -150; // default
    light.shadow.camera.right = 150; // default
    light.shadow.camera.bottom = -150; // default
    light.shadow.camera.top = 150; // default
  }
}

class Model extends THREE.Group {
  constructor({
    opacity,
    jointColor,
    limbColor,
    angleColor,
    pose,
    updateAngle,
    isStudent = false,
    outlines = null,
    sessionSourceType = "recording",
    offset = 0,
  }) {
    super();

    const clip = pose.clip;
    const skeleton = pose.skeleton;
    skeleton.limbs = new Array();
    this.sessionSourceType = sessionSourceType;
    this.outlines = outlines;
    this.updateAngle = updateAngle;
    this.isStudent = isStudent;

    // this.normalizePose(clip.tracks, offset);

    const poseMixer = (this.poseMixer = new THREE.AnimationMixer(this));
    const animations = (this.animations = [clip]);
    this.actions = [poseMixer.clipAction(animations[0])];
    this.clipBones = this.getBones(skeleton.bones[0].clone(), "clip");
    this.skeleton = skeleton;

    this.jointHelper = new JointHelper({
      opacity: opacity,
      color: jointColor,
      bones: this.clipBones,
      clip: this.animations[0],
    });

    const limbGeom = new THREE.SphereGeometry(1);
    const limbMat = new THREE.MeshLambertMaterial({
      color: limbColor,
      transparent: true,
      opacity: 0.85 * opacity,
      reflectivity: 0,
    });

    const texture = new THREE.TextureLoader().load("/api/files/cross.jpg");
    const textureRef = new THREE.TextureLoader().load(
      "/api/files/crossRef.jpg",
    );
    const textureMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      opacity: 0.85 * opacity,
    });
    const textureMaterialRef = new THREE.MeshLambertMaterial({
      map: textureRef,
      opacity: 0.85 * opacity,
    });

    this.limbHelper = new LimbHelper(
      {
        colorsMap: this.jointHelper.colorsMap,
        sessionSourceType: sessionSourceType,
        geometry: limbGeom,
        material: limbMat,
        textureMaterial: isStudent ? textureMaterial : textureMaterialRef,
      },
      { bones: skeleton.bones },
    );

    this.angleHelper = new AngleHelper(
      { angleColor: angleColor, opacity: opacity },
      { bones: skeleton.bones },
    );

    this.add(this.jointHelper);
    this.add(this.limbHelper);
    this.add(this.angleHelper);
  }

  deleteAllAngles() {
    this.angleHelper.deleteAllAngles();
  }

  deleteAngle(name) {
    this.angleHelper.deleteAngle(name);
  }

  update(frame) {
    this.updateMixer(frame);

    this.jointHelper.update(frame);
    this.limbHelper.update(frame, this.jointHelper.colorsMap);
    this.updateAngles();
  }

  updateAngles() {
    const angles = this.angleHelper.update();

    if (angles) {
      angles.map((angleS) => {
        this.updateAngle(
          {
            name: angleS.name,
            angle: angleS.angle,
          },
          this.isStudent,
        );
      });
    }
  }

  updateMixer(frame) {
    const actionID = 2;
    const mixer = this.poseMixer;
    const curAction = this.actions[actionID];

    mixer.stopAllAction();

    curAction.play();

    mixer.setTime(curAction.getClip().tracks[0].times[frame]);
  }

  normalizePose(tracks, position) {
    const tracksNum = tracks.length;

    for (const i of Array(tracksNum / 2).keys()) {
      tracks[i * 2 + 0].times = tracks[i * 2 + 0].times
        .reverse()
        .subarray(2)
        .reverse();
      tracks[i * 2 + 0].values = tracks[i * 2 + 0].values
        .subarray(3)
        .reverse()
        .subarray(3)
        .reverse();

      tracks[i * 2 + 1].times = tracks[i * 2 + 1].times
        .reverse()
        .subarray(2)
        .reverse();
      tracks[i * 2 + 1].values = tracks[i * 2 + 1].values
        .subarray(4)
        .reverse()
        .subarray(4)
        .reverse();
    }

    for (const track of tracks) {
      if (track.ValueTypeName === "vector") {
        const originValues = tracks[0].values;
        const num = originValues.length;

        for (let j = 0; j < num; j++) track.values[j] -= originValues[j];
      }
    }

    // Shifts the trajectory poses to be shifted 150 units to the left and 150 unites to the back
    for (let index = 0; index < tracks[0].values.length / 3; index++) {
      tracks[0].values[index * 3] -= -100 + position * 100;
      tracks[0].values[index * 3 + 2] += position * 100;
    }
  }

  normalizeSkin(tracks) {
    this.normalizePose(tracks);
  }

  getBones(node, type) {
    const list = [];

    if (type !== "clip" || node.name !== "ENDSITE") list.push(node);

    for (const bone of node.children)
      list.push.apply(list, this.getBones(bone, type));

    return list;
  }

  getPosMap(framesNum) {
    const bufBones = this.clipBones;
    const bonesNum = bufBones.length;
    const clip = this.animations[0];
    const posMap = [];

    for (const i of Array(bonesNum).keys()) posMap[i] = [];

    for (const i of Array(framesNum).keys()) {
      for (const j of Array(bonesNum).keys()) {
        const vectorKeyframeTrack = clip.tracks[j * 2 + 0];
        const quaternionKeyframeTrack = clip.tracks[j * 2 + 1];

        bufBones[j].position.copy(
          new THREE.Vector3(
            vectorKeyframeTrack.values[i * 3 + 0],
            vectorKeyframeTrack.values[i * 3 + 1],
            vectorKeyframeTrack.values[i * 3 + 2],
          ),
        );

        bufBones[j].setRotationFromQuaternion(
          new THREE.Quaternion(
            quaternionKeyframeTrack.values[i * 4 + 0],
            quaternionKeyframeTrack.values[i * 4 + 1],
            quaternionKeyframeTrack.values[i * 4 + 2],
            quaternionKeyframeTrack.values[i * 4 + 3],
          ),
        );
      }

      for (const j of Array(bonesNum).keys()) {
        posMap[j][i] = new THREE.Vector3();

        bufBones[j].getWorldPosition(posMap[j][i]);
      }
    }

    return posMap;
  }

  createAction(colorsMap, name, path) {
    const animation = this.createAnimation(colorsMap, name, path);
    this.animations.push(animation);
    this.actions.push(this.poseMixer.clipAction(animation));
  }

  createAnimation(colorsMap, name, path) {
    const bones = this.clipBones;
    const bonesNum = bones.length;
    const clipTracks = this.animations[0].tracks;
    const clipTimes = clipTracks[0].times;
    const tracks = [];

    if (path) {
      const framesNum = path.length;
      const delta = clipTimes[1] - clipTimes[0];
      const times = [];

      for (const i of Array(framesNum).keys())
        times[i] = !i ? 0 : times[i - 1] + delta;

      for (const i of Array(bonesNum).keys()) {
        const positions = [];
        const rotations = [];

        for (const j of Array(framesNum).keys()) {
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 0]);
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 1]);
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 2]);

          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 0]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 1]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 2]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 3]);
        }

        tracks[i * 2 + 0] = new THREE.VectorKeyframeTrack(
          bones[i].name + ".position",
          times,
          positions,
        );
        tracks[i * 2 + 1] = new THREE.QuaternionKeyframeTrack(
          bones[i].name + ".quaternion",
          times,
          rotations,
        );
      }
    } else {
      for (const i of Array(bonesNum).keys()) {
        tracks[i * 2 + 0] = new THREE.VectorKeyframeTrack(
          bones[i].name + ".position",
          clipTimes,
          clipTracks[i * 2 + 0].values,
        );
        tracks[i * 2 + 1] = new THREE.QuaternionKeyframeTrack(
          bones[i].name + ".quaternion",
          clipTimes,
          clipTracks[i * 2 + 1].values,
        );
      }
    }

    return new THREE.AnimationClip(name, -1, tracks);
  }
}

export { Viewer };
