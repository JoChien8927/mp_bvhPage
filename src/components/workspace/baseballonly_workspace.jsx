//only baseball animation is implemented in this file
import React from "react";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import basebaseball_model from "../../assets/model/baseball/gr_baseball.gltf";

class BaseballWorkspace extends React.Component {
    constructor(props) {
      super(props);
      this.containerRef = React.createRef();
      this.baseballMixer = null;

      this.state = {
        playbackIsPlay: true,
        playbackCurFrame: 0,
        playbackMaxValue: 0,
        motion_fps: this.props.fps,
        baseball_motion: process.env.PUBLIC_URL + "/exp/" + this.props.sportType + "/baseball_motion.json",
      };

      this.baseball = null;
    }

    componentDidMount = () => {
      this.init();
      this.loadBaseball();
    }

    init = () => {
      const clock = new THREE.Clock();
      const container = this.containerRef.current;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
      this.camera.position.set(0, 50, 200);
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setClearColor(0xeeeeee); // Background color
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.autoRotate = false;

      const hemiLight = new THREE.AmbientLight(0x636363, 2);
      hemiLight.position.set(0, 200, 0);
      this.scene.add(hemiLight);

      const gridHelper = new THREE.GridHelper(1000, 50);
      gridHelper.material.opacity = 0.2;
      gridHelper.material.transparent = true;
      this.scene.add(gridHelper);

      const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
      const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = - Math.PI / 2;
      plane.position.y = -45; // Slightly below the grid
      this.scene.add(plane);

      window.addEventListener('resize', this.onWindowResize, false);
      this.animate(clock);
    }

    loadBaseball = () => {
      const ballloader = new GLTFLoader();

      const loadbaseball = new Promise((resolve, reject) => {
        ballloader.load(basebaseball_model, model => {
          this.baseball = model.scene;
          this.baseball.scale.set(1, 1, 1);
          this.baseball.position.set(0, 0, 0);
          this.scene.add(this.baseball);
          resolve(model);
        }, undefined, reject);
      });

      const loadBallMotion = new Promise((resolve, reject) => {
        fetch(this.state.baseball_motion)
          .then(response => response.json())
          .then(data => {
            const times = [];
            const positionValues = [];
            const numFrames = data.x.length;
            for (let i = 0; i < numFrames; i++) {
              times.push(i * 1 / this.state.motion_fps);
              positionValues.push(data.z[i] * 50, data.y[i] * 50, data.x[i] * 50);
            }
            const positionKF = new THREE.VectorKeyframeTrack('.position', times, positionValues);
            resolve(new THREE.AnimationClip('BaseballMovement', -1, [positionKF]));
          })
          .catch(error => reject(error));
      });

      Promise.all([loadbaseball, loadBallMotion]).then((result) => {
        const baseballModel = result[0];
        const baseballClip = result[1];
        this.baseballMixer = new THREE.AnimationMixer(this.baseball);
        const action = this.baseballMixer.clipAction(baseballClip);
        action.play();

        this.setState({
          playbackMaxValue: baseballClip.duration,
        });
      });
    }

    onWindowResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate = (clock) => {
      requestAnimationFrame(() => this.animate(clock));
      const delta = clock.getDelta();
      if (this.baseballMixer && this.state.playbackIsPlay) {
        this.baseballMixer.update(delta);
        this.setState({
          playbackCurFrame: this.baseballMixer.time,
        });
      }
      this.renderer.render(this.scene, this.camera);
      this.controls.update();
    }

    handleSliderChange = (event) => {
      const newTime = parseFloat(event.target.value);
      this.baseballMixer.setTime(newTime);
      this.setState({
        playbackCurFrame: newTime,
        playbackIsPlay: false, // Pause the animation while scrubbing
      });
    }

    togglePlayPause = () => {
      this.setState((prevState) => ({
        playbackIsPlay: !prevState.playbackIsPlay,
      }));
    }

    render() {
      return (
        <div>
          <div ref={this.containerRef}></div>
          <button onClick={this.togglePlayPause}>
            {this.state.playbackIsPlay ? 'Pause' : 'Play'}
          </button>
          <input
            type="range"
            min="0"
            max={this.state.playbackMaxValue}
            step="0.01"
            value={this.state.playbackCurFrame}
            onChange={this.handleSliderChange}
            style={{ width: '100%' }}
          />
        </div>
      );
    }
}

export default BaseballWorkspace;
