// loaders.js
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import * as THREE from "three/build/three.module.js";

export const loadPose = (skeleton_path) => {
    const bvhloader = new BVHLoader();
    return new Promise((resolve, reject) => {
        fetch(skeleton_path)
            .then(response => {
                bvhloader.load(skeleton_path, result => {
                    console.log("BVH Data:", result);
                    const clip = result.clip;
                    const duration = clip.duration;
                    console.log('BVH animation duration:', duration);
                    resolve({ result, duration });
                });
            })
            .catch(error => {
                console.error("Error loading BVH data:", error);
                reject(error);
            });
    });
};

export const loadBat = (bat_model) => {
    const batloader = new GLTFLoader();
    return new Promise((resolve, reject) => {
        batloader.load(bat_model, model => {
            const baseballBat = model.scene;
            //adjust the size and rotation to match the real bat
            baseballBat.scale.set(1, 1.5, 1);    
            baseballBat.rotation.set(0, 0, 90);
            // visualize the track spot (knob & end of bat)
            const knob_cord = 1;
            const end_cord = 16;
            const knob = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xff0000 })); //red
            const end = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0x0000ff })); //blue
            knob.name = 'knob';
            end.name = 'end';
            knob.position.set(knob_cord, 0, 0);
            end.position.set(end_cord, 0, 0);
            baseballBat.add(knob);
            baseballBat.add(end);
            resolve(model);
        }, undefined, reject);
    });
};

export const loadBaseball = (basebaseball_model) => {
    const ballloader = new GLTFLoader();
    return new Promise((resolve, reject) => {
        ballloader.load(basebaseball_model, resolve);
    });
};

export const loadBallMotion = (baseball_motion, fps) => {
    return new Promise((resolve, reject) => {
        try {
            const times = [];
            const positionValues = [];
            fetch(baseball_motion)
                .then(response => response.json())
                .then(data => {
                    const numFrames = data.x.length;
                    for (let i = 0; i < numFrames; i++) {
                        times.push(i * 1 / fps);
                        if (data.x[i] === -1 && data.y[i] === -1 && data.z[i] === -1) {
                            data.x[i], data.y[i], data.z[i] = -1000;
                        }
                        positionValues.push(
                            data.z[i] * (50),
                            data.y[i] * (-50),
                            data.x[i] * (50)
                        );
                    }
                    const positionKF = new THREE.VectorKeyframeTrack('.position', times, positionValues);
                    resolve(new THREE.AnimationClip('BaseballMovement', -1, [positionKF]));
                })
                .catch(error => {
                    console.error("Error loading baseball motion:", error);
                    reject(error);
                });
        } catch (error) {
            console.error("Failed to process ball Motion:", error);
            reject(error);
        }
    });
};

export const loadBatMotion = (bat_motion, fps) => {
    return new Promise((resolve, reject) => {
        try {
            const times = [];
            const knobPositions = [];
            const rotations = [];
            fetch(bat_motion)
                .then(response => response.json())
                .then(data => {
                    const numFrames = data.end_x.length;
                    for (let i = 0; i < numFrames; i++) {
                        times.push(i / fps);
                        const knobPos = new THREE.Vector3(data.knob_z[i] * (50), data.knob_y[i] * (-50), data.knob_x[i] * (50));
                        const endPos = new THREE.Vector3(data.end_z[i] * (50), data.end_y[i] * (-50), data.end_x[i] * (50));
                        const knobToEnd = new THREE.Vector3().subVectors(endPos, knobPos).normalize();

                        knobPositions.push(
                            data.knob_z[i] * (50),
                            data.knob_y[i] * (-50),
                            data.knob_x[i] * (50)
                        );

                        const axis = new THREE.Vector3(1, 0, 0);
                        const angle = Math.acos(knobToEnd.dot(axis));
                        const rotAxis = axis.cross(knobToEnd).normalize();
                        const quaternion = new THREE.Quaternion().setFromAxisAngle(rotAxis, angle);
                        rotations.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
                    }

                    const rotationKF = new THREE.QuaternionKeyframeTrack(".quaternion", times, rotations);
                    const knobKF = new THREE.VectorKeyframeTrack(".knob.position", times, knobPositions);
                    const batClip = new THREE.AnimationClip('BatMovement', -1, [rotationKF, knobKF]);
                    resolve(batClip);
                })
                .catch(error => {
                    console.error("Error loading bat motion:", error);
                    reject(error);
                });
        } catch (error) {
            console.error("Failed to process bat motion:", error);
            reject(error);
        }
    });
};
