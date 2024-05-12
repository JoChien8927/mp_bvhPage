import * as THREE from "three/build/three.module.js";
import { create, all } from "mathjs";

const config = {};
const math = create(all, config);

class JointHelper extends THREE.Group {
  constructor({ opacity, color, bones, clip }) {
    super();

    const joints = (this.joints = []);
    const geometry = new THREE.SphereBufferGeometry(0);

    for (const bone of bones) {
      const joint = this.createJoint(geometry, bone, opacity);
      joints.push(joint);
    }

    this.createJointTree(bones[0], joints[0]);

    this.add(joints[0]);

    this.clip = clip;
    this.mixer = new THREE.AnimationMixer(this);
    this.animations = [];

    this.actions = [];
    const threeColor = new THREE.Color(color);
    this.colorsMap = this.createColorsMap(
      threeColor.r,
      threeColor.g,
      threeColor.b,
    );

    this.createAction(this.colorsMap, "default jointsAnimation");
  }

  update(frame) {
    this.currentFrame = frame;
    const actionID = 2;
    const mixer = this.mixer;
    const curAction = this.actions[actionID];

    mixer.stopAllAction();

    curAction.play();

    mixer.setTime(curAction.getClip().tracks[0].times[frame]);
  }

  createJoint(geometry, bone, opacity) {
    const joint = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ transparent: true, opacity: opacity }),
    );

    joint.name = bone.name;

    joint.castShadow = true; //default is false
    joint.receiveShadow = false; //default is false

    return joint;
  }

  createJointTree(bone, joint) {
    const boneChildren = bone.children;
    const joints = this.joints;

    for (const boneChild of boneChildren)
      for (const jointChild of joints)
        if (boneChild.name === jointChild.name)
          joint.add(this.createJointTree(boneChild, jointChild));

    return joint;
  }

  createColorsMap(r, g, b) {
    const jointsNum = this.joints.length;
    const framesNum = this.clip.tracks[0].times.length;
    const colorsMap = [];

    for (const i of Array(jointsNum).keys()) {
      colorsMap[i] = [];

      for (const j of Array(framesNum).keys()) {
        colorsMap[i][j * 3 + 0] = r;
        colorsMap[i][j * 3 + 1] = g;
        colorsMap[i][j * 3 + 2] = b;
      }
    }

    return colorsMap;
  }

  createAction(colorsMap, name, path) {
    this.colorsMap = colorsMap;
    const animation = this.createAnimation(colorsMap, name, path);
    this.animations.push(animation);
    this.actions.push(this.mixer.clipAction(animation));
  }

  createAnimation(colorsMap, name, path) {
    const joints = this.joints;
    const jointsNum = joints.length;
    const clipTracks = this.clip.tracks;
    const clipTimes = clipTracks[0].times;
    const tracks = [];

    if (path) {
      const framesNum = path.length;
      const delta = clipTimes[1] - clipTimes[0];
      const times = [];
      const colors = [];

      for (const i of Array(framesNum).keys())
        times[i] = !i ? 0 : times[i - 1] + delta;

      for (const i of Array(jointsNum).keys()) {
        const positions = [];
        const rotations = [];

        colors[i] = [];

        for (const j of Array(framesNum).keys()) {
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 0]);
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 1]);
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 2]);

          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 0]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 1]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 2]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 3]);

          colors[i].push(colorsMap[i][j * 3 + 0]);
          colors[i].push(colorsMap[i][j * 3 + 1]);
          colors[i].push(colorsMap[i][j * 3 + 2]);
        }

        tracks[i * 3 + 0] = new THREE.VectorKeyframeTrack(
          joints[i].name + ".position",
          times,
          positions,
        );
        tracks[i * 3 + 1] = new THREE.QuaternionKeyframeTrack(
          joints[i].name + ".quaternion",
          times,
          rotations,
        );
        tracks[i * 3 + 2] = new THREE.ColorKeyframeTrack(
          joints[i].name + ".material.color",
          times,
          colors[i],
        );
      }
    } else {
      for (const i of Array(jointsNum).keys()) {
        tracks[i * 3 + 0] = new THREE.VectorKeyframeTrack(
          joints[i].name + ".position",
          clipTimes,
          clipTracks[i * 2 + 0].values,
        );
        tracks[i * 3 + 1] = new THREE.QuaternionKeyframeTrack(
          joints[i].name + ".quaternion",
          clipTimes,
          clipTracks[i * 2 + 1].values,
        );
        tracks[i * 3 + 2] = new THREE.ColorKeyframeTrack(
          joints[i].name + ".material.color",
          clipTimes,
          colorsMap[i],
        );
      }
    }

    return new THREE.AnimationClip(name, -1, tracks);
  }
}

class LimbHelper extends THREE.Group {
  constructor(
    { geometry, material, textureMaterial, sessionSourceType },
    { bones },
  ) {
    super();

    this.bones = bones;
    this.boneNames = bones
      .filter((x) => x.name != "ENDSITE")
      .map((x) => x.name);

    this.geometry = geometry;
    const bigGeometry =
      sessionSourceType == "mediapipe"
        ? new THREE.SphereBufferGeometry(3.5)
        : new THREE.SphereBufferGeometry(4);
    const smallGeometry = new THREE.SphereBufferGeometry(1.7);

    for (const bone of bones) {
      const joint = new THREE.Mesh(
        bone.name.toLowerCase().includes("hand") &&
        bone.name.toLowerCase() != "righthand" &&
        bone.name.toLowerCase() != "lefthand"
          ? smallGeometry
          : bigGeometry,
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 1,
          color: "#000",
        }),
      );

      joint.name = bone.name + "_Joint";

      joint.castShadow = true; //default is false
      joint.receiveShadow = false; //default is false

      if (
        bone.name.toLowerCase().includes("head") ||
        bone.name.toLowerCase().includes("nose")
      ) {
        bone.attach(joint);
        continue;
      }

      bone.children.forEach((child) => {
        let boneMesh = new THREE.Mesh(geometry, material);
        if (
          child.name.toLowerCase().includes("head") ||
          child.name.toLowerCase().includes("nose")
        ) {
          boneMesh = new THREE.Mesh(geometry, textureMaterial);
        }

        boneMesh.name = child.name + "_Limb";
        boneMesh.castShadow = true; //default is false
        boneMesh.receiveShadow = false; //default is false
        boneMesh.lookAt(child.position);

        const x = math.abs(child.position.x);
        const y = math.abs(child.position.y);
        const z = math.abs(child.position.z);

        let max = 0;
        let width = 0;

        if (sessionSourceType == "mediapipe") {
          max = math.max(x, y, z);
          width = max * 0.5 >= 8 ? 8 : max * 0.5;
          if (
            child.name.toLowerCase().includes("lefthip") ||
            child.name.toLowerCase().includes("righthip")
          ) {
            width = max * 0.4 >= 5 ? 5 : max * 0.4;
          } else if (
            child.name.toLowerCase().includes("leftknee") ||
            child.name.toLowerCase().includes("rightknee")
          ) {
            width = max * 0.8 >= 12 ? 12 : max * 0.8;
          } else if (
            child.name.toLowerCase().includes("leftankle") ||
            child.name.toLowerCase().includes("rightankle")
          ) {
            width = max * 0.7 >= 9 ? 9 : max * 0.7;
          } else if (child.name.toLowerCase().includes("endsite")) {
            width = max * 0.4 >= 4 ? 4 : max * 0.4;
          } else if (child.name.toLowerCase().includes("midshoulder")) {
            width = max * 0.5 >= 6 ? 6 : max * 0.5;
          } else if (child.name.toLowerCase().includes("spine")) {
            width = max * 0.5 >= 6 ? 6 : max * 0.5;
          } else if (
            child.name.toLowerCase().includes("leftshoulder") ||
            child.name.toLowerCase().includes("rightshoulder")
          ) {
            width = max * 0.5 >= 5 ? 5 : max * 0.5;
          } else if (
            child.name.toLowerCase().includes("leftelbow") ||
            child.name.toLowerCase().includes("rightelbow")
          ) {
            width = max * 0.7 >= 8 ? 8 : max * 0.5;
          } else if (
            child.name.toLowerCase().includes("leftwrist") ||
            child.name.toLowerCase().includes("rightwrist")
          ) {
            width = max * 0.6 >= 6 ? 6 : max * 0.5;
          }

          if (child.name.toLowerCase().includes("nose")) {
            boneMesh.rotation.z = -Math.PI / 2;
            boneMesh.scale.set(width * 2, width * 2, max * 0.4);
          } else {
            boneMesh.scale.set(width, width, max * 0.5);
          }
        } else {
          max =
            child.name === "ENDSITE"
              ? math.max(x, y, z) / 2
              : math.max(x, y, z);

          width = max * 0.4 >= 9.5 ? 9.5 : max * 0.4;
          if (
            child.name.toLowerCase().includes("rightleg") ||
            child.name.toLowerCase().includes("leftleg")
          ) {
            width = max * 0.8 >= 13 ? 13 : max * 0.8;
          } else if (
            child.name.toLowerCase().includes("rightfoot") ||
            child.name.toLowerCase().includes("leftfoot")
          ) {
            width = max * 0.8 >= 11 ? 11 : max * 0.8;
          } else if (
            child.parent.name.toLowerCase().includes("rightfoot") ||
            child.parent.name.toLowerCase().includes("leftfoot")
          ) {
            width = 6;
          } else if (
            child.name.toLowerCase().includes("leftforearm") ||
            child.name.toLowerCase().includes("rightforearm")
          ) {
            width = max * 0.8 >= 10 ? 10 : max * 0.8;
          } else if (
            child.name.toLowerCase() == "lefthand" ||
            child.name.toLowerCase() == "righthand"
          ) {
            width = max * 0.8 >= 8 ? 8 : max * 0.8;
          }

          if (child.name.toLowerCase().includes("head")) {
            boneMesh.rotation.z = -Math.PI / 2;
            boneMesh.scale.set(width * 3.5, width * 3.5, max * 1.9);
          } else {
            boneMesh.scale.set(width, width, max * 0.95);
          }
        }

        bone.attach(boneMesh);
        bone.attach(joint);
      });
    }
    this.add(bones[0]);
  }

  setPositions(parent) {
    if (!parent?.children?.length || parent?.name == "ENDSITE") {
      return;
    }

    const jointPosition = parent.children.length - 1;
    const jointName = parent.children[jointPosition].name.replace("_Joint", "");

    const bonePosition = this.boneNames.indexOf(jointName);
    const r = this.colorsMap[bonePosition][this.frame * 3];
    const g = this.colorsMap[bonePosition][this.frame * 3 + 1];
    const b = this.colorsMap[bonePosition][this.frame * 3 + 2];

    parent.children[jointPosition].position.set(0, 0, 0);
    parent.children[jointPosition].material.color = new THREE.Color(r, g, b);

    if (
      parent?.name?.toLowerCase().includes("head") ||
      parent?.name?.toLowerCase().includes("nose")
    ) {
      return;
    }

    for (let i = 0; i < (parent.children.length - 1) / 2; i++) {
      const child = parent.children[i];
      const childLimb = parent.children[i + (parent.children.length - 1) / 2];

      if (child.name.toLowerCase().includes("head")) {
        childLimb.position.set(
          child.position.x / 2,
          child.position.y,
          child.position.z / 2,
        );
      } else if (child.name.toLowerCase().includes("nose")) {
        childLimb.position.set(
          child.position.x / 2,
          child.position.y / 2,
          child.position.z,
        );
      } else {
        childLimb.position.set(
          child.position.x / 2,
          child.position.y / 2,
          child.position.z / 2,
        );
      }

      this.setPositions(child);
    }
  }

  update(frame, colorsMap) {
    this.colorsMap = colorsMap;
    this.frame = frame;
    this.setPositions(this.children[0]);
  }
}

class AngleHelper extends THREE.Group {
  constructor({ angleColor, opacity }, { bones }) {
    super();
    this.angleColor = angleColor;
    this.opacity = opacity;
    this.bones = bones;
    this.angleGroup = new Array();
  }

  getArrowDirection(origin, dir) {
    let normDir = new THREE.Vector3(
      dir.x - origin.x,
      dir.y - origin.y,
      dir.z - origin.z,
    );
    normDir = normDir.normalize();
    return normDir;
  }

  getAngleCircleDirection(origin, dir1, dir2) {
    var dir1Vector = new THREE.Vector3(
      dir1.x - origin.x,
      dir1.y - origin.y,
      dir1.z - origin.z,
    );
    var dir2Vector = new THREE.Vector3(
      dir2.x - origin.x,
      dir2.y - origin.y,
      dir2.z - origin.z,
    );
    let planeDirection = new THREE.Vector3(0, 0, 0);
    planeDirection.crossVectors(dir1Vector, dir2Vector);
    const x = origin.x + planeDirection.x * 200;
    const y = origin.y + planeDirection.y * 200;
    const z = origin.z + planeDirection.z * 200;

    return new THREE.Vector3(x, y, z);
  }

  createArrow(origin, dir) {
    var length = origin.distanceTo(dir) + 20;
    return new THREE.ArrowHelper(
      this.getArrowDirection(origin, dir),
      origin,
      length,
      this.angleColor,
      10,
    );
  }

  setArrowPos(origin, dir, arrowHelper) {
    arrowHelper.position.set(origin.x, origin.y, origin.z);
    arrowHelper.setDirection(this.getArrowDirection(origin, dir));
  }

  setCirclePos(circle, origin, dir1, dir2) {
    const circleDir = this.getAngleCircleDirection(origin, dir1, dir2);

    // The spheres are used to determine the specific position where the circle starts
    var sphereGeom = new THREE.SphereBufferGeometry(5);
    var sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: false,
      opacity: 1,
    });

    var sphereMesh1 = new THREE.Mesh(sphereGeom, sphereMaterial);
    var sphereMesh2 = new THREE.Mesh(sphereGeom, sphereMaterial);

    sphereMesh1.attach(sphereMesh2);
    sphereMesh2.position.set(50, 0, 0);
    sphereMesh1.position.set(origin.x, origin.y, origin.z);
    sphereMesh1.lookAt(circleDir);

    const circleStart = new THREE.Vector3();
    sphereMesh2.getWorldPosition(circleStart);

    let angleToTranslate = this.angleBetweenThreePoints(
      origin,
      circleStart,
      dir1,
    );
    let angle = this.angleBetweenThreePoints(origin, dir1, dir2);

    angleToTranslate =
      angleToTranslate > 0 ? -angleToTranslate : 2 * math.pi - angleToTranslate;

    circle.geometry.dispose();
    circle.geometry = new THREE.CircleGeometry(
      20,
      32,
      -angleToTranslate, // -2 * math.pi * 0.75 => at 0 degrees and then goes clockwise
      math.abs(angle),
    );

    circle.position.set(origin.x, origin.y, origin.z);
    circle.lookAt(circleDir);
  }

  setArrows(originJoint, directionJoint1, directionJoint2) {
    const origin = new THREE.Vector3();
    const dir1 = new THREE.Vector3();
    const dir2 = new THREE.Vector3();

    originJoint.getWorldPosition(origin);
    directionJoint1.getWorldPosition(dir1);
    directionJoint2.getWorldPosition(dir2);

    const arrowHelper1 = this.createArrow(origin, dir1);
    const arrowHelper2 = this.createArrow(origin, dir2);

    this.add(arrowHelper1);
    this.add(arrowHelper2);

    const material = new THREE.MeshLambertMaterial({
      color: this.angleColor,
      transparent: true,
      opacity: this.opacity,
      side: THREE.DoubleSide,
    });

    const circle = new THREE.Mesh(new THREE.CircleGeometry(20, 32), material);
    this.setCirclePos(
      circle,
      origin,
      dir1.y > dir2.y ? dir1 : dir2,
      dir1.y > dir2.y ? dir2 : dir1,
    );
    this.add(circle);

    const angle = math.abs(this.angleBetweenThreePoints(origin, dir1, dir2));
    const name =
      originJoint.name +
      ", " +
      directionJoint1.name +
      ", " +
      directionJoint2.name;
    this.angleGroup.push({
      name: name,
      arrowHelper1: arrowHelper1,
      arrowHelper2: arrowHelper2,
      joints: [originJoint, directionJoint1, directionJoint2],
      circle: circle,
      angle: angle,
    });

    return {
      name: name,
      angle: (angle * 180) / math.pi,
    };
  }

  midPointCalculator(vector1, vector2) {
    let x = (vector1.x + vector2.x) / 2;
    let y = (vector1.y + vector2.y) / 2;
    let z = (vector1.z + vector2.z) / 2;
    return new THREE.Vector3(x, y, z);
  }

  angleBetweenThreePoints(p1, p2, p3) {
    var vector1 = [p2.x - p1.x, p2.y - p1.y, p2.z - p1.z];
    var vector2 = [p3.x - p1.x, p3.y - p1.y, p3.z - p1.z];

    var a = new THREE.Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    var b = new THREE.Vector3(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);

    let planeDirection = new THREE.Vector3(0, 0, 0);
    planeDirection.crossVectors(a, b);
    const x = origin.x + planeDirection.x * 200;
    const y = origin.y + planeDirection.y * 200;
    const z = origin.z + planeDirection.z * 200;

    var n = new THREE.Vector3(x, y, z);

    planeDirection.normalize();

    // a.normalize()
    // b.normalize()
    // n.normalize()

    let direction = p1.dot(p2, n);
    if (!direction) direction = -1;

    var teta =
      (direction / math.abs(direction)) *
      math.acos(
        math.multiply(vector1, vector2) /
          math.multiply(math.norm(vector1), math.norm(vector2)),
      );

    return teta;
  }

  update() {
    this.angleGroup.forEach((angle) => {
      const origin = new THREE.Vector3();
      const dir1 = new THREE.Vector3();
      const dir2 = new THREE.Vector3();
      angle.joints[0].getWorldPosition(origin);
      angle.joints[1].getWorldPosition(dir1);
      angle.joints[2].getWorldPosition(dir2);

      this.setArrowPos(origin, dir1, angle.arrowHelper1);
      this.setArrowPos(origin, dir2, angle.arrowHelper2);

      this.setCirclePos(
        angle.circle,
        origin,
        dir1.y > dir2.y ? dir1 : dir2,
        dir1.y > dir2.y ? dir2 : dir1,
      );

      angle.angle = math.abs(this.angleBetweenThreePoints(origin, dir1, dir2));
    });

    return this.angleGroup.map((x) => {
      return {
        name:
          x.joints[0].name + ", " + x.joints[1].name + ", " + x.joints[2].name,
        angle: (x.angle * 180) / math.pi,
      };
    });
  }

  deleteAngle(name) {
    const angle = this.angleGroup.find((x) => x.name == name);
    if (angle) {
      this.remove(angle.circle);
      this.remove(angle.arrowHelper1);
      this.remove(angle.arrowHelper2);
      this.angleGroup = this.angleGroup.filter((x) => x.name != name);
    }
  }

  deleteAllAngles() {
    this.angleGroup.forEach((angle) => {
      this.remove(angle.circle);
      this.remove(angle.arrowHelper1);
      this.remove(angle.arrowHelper2);
    });
    this.angleGroup = new Array();
  }
}

export { JointHelper, LimbHelper, AngleHelper };
