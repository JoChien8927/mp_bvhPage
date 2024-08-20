import React from "react";
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

// import CanvasDraw from "react-canvas-draw";
import Playback from "./ctrl/playback";
import { ActionRecordingActions } from "../../redux/action-recording/action-recording-action";
import * as THREE from "three/build/three.module.js";
import npyjs from "npyjs";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

//models
import bat_model from "../../assets/model/baseballbat.gltf";
import basebaseball_model from "../../assets/model/baseball/gr_baseball.gltf";
import grass_texture from "../../assets/texture/ograss_tex.jpg";






class BaseballWorkspace extends React.Component {
    constructor(props) {
      super(props);
      this.containerRef = React.createRef();
			
			this.animationMixer = null;
      this.baseballMixer = null;  
      this.batMixer = null;
      
      this.state = {
        playbackIsPlay: true,
        playbackIsLoop: false,
        playbackSpeed: 1,
        playbackMaxValue: 0,
        playbackCurFrame: [0, 0, 0],
        playbackBadValue: [],
        playbackBadColor: [],

        frameNum: 0,
  
        accuracy: {
          good: 0,
          neutral: 0,
          bad: 0,
        },
        currentSportType: this.props.sportType, // Initialize currentSportType from props
        motion_fps : this.props.fps,
        skeleton_path: process.env.PUBLIC_URL+"/exp/"+this.props.sportType+"/kpts_3d_"+this.props.sportType+".bvh",
        secondSkeletonPath: process.env.PUBLIC_URL + "/exp/demo/kpts_3d_demo1.bvh", // New BVH file path
        bat_motion : process.env.PUBLIC_URL+"/exp/"+"demo"+"/bat_motion.json",
        baseball_motion : process.env.PUBLIC_URL+"/exp/"+"demo"+"/baseball_motion.json",

      };

      this.baseball = null;
      this.baseballBat = null;

    }

    
    
    componentDidUpdate(prevProps) {
      // 檢查 sportType 或 fps 是否有變化
      if (prevProps.sportType !== this.props.sportType || prevProps.fps !== this.props.fps) {
        this.updateInternalState(this.props.sportType, this.props.fps);
      }
    }
    updateInternalState = (sportType, fps) => {
    this.setState({
      currentSportType: this.props.sportType,
      skeleton_path: `${process.env.PUBLIC_URL}/exp/${this.props.sportType}/kpts_3d_${this.props.sportType}.bvh`,

    });
    if (this.state.currentSportType === 'pitching' ) {
      this.setState({
      currentSportType: this.props.sportType,
      motion_fps: fps,
      bat_motion: `${process.env.PUBLIC_URL}/exp/empty/bat_motion.json`,
      baseball_motion: `${process.env.PUBLIC_URL}/exp/${this.props.sportType}/baseball_motion.json`,
    });
    }else if (this.state.currentSportType === 'batting') {
      this.setState({
      currentSportType: this.props.sportType,
      motion_fps: fps,
      bat_motion: `${process.env.PUBLIC_URL}/exp/${this.props.sportType}/bat_motion.json`,
      baseball_motion: `${process.env.PUBLIC_URL}/exp/empty/baseball_motion.json`,
    });}else if (this.state.currentSportType === 'demo') {
      this.setState({
      currentSportType: this.props.sportType,
      motion_fps: fps,
      bat_motion: `${process.env.PUBLIC_URL}/exp/demo/bat_motion.json`,
      baseball_motion: `${process.env.PUBLIC_URL}/exp/demo/baseball_motion.json`,
    });}
        else {
      this.setState({
      currentSportType: this.props.sportType,
      motion_fps: fps,
      bat_motion: `${process.env.PUBLIC_URL}/exp/empty/bat_motion.json`,
      baseball_motion: `${process.env.PUBLIC_URL}/exp/demo/baseball_motion.json`,
    });
    }
    
  }
    componentDidMount=()=>{
       console.log("Component mounted with sportType:", this.state.currentSportType);
      var clock = new THREE.Clock();

      var camera, controls, scene, renderer, hemiLight;
      var mixer,secondMixer, ballmixer, batmixer,skeletonHelper;

      var bvhloader = new BVHLoader();
      var batloader = new GLTFLoader();
      var ballloader = new GLTFLoader();
      var virtualbat_length = 0;      
      const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });  
      const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });  
      const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });


    const loadpose = new Promise((resolve, reject) => {
    fetch(this.state.skeleton_path)
    .then(response => {
        bvhloader.load(this.state.skeleton_path, result => {
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
    const loadSecondPose = new Promise((resolve, reject) => {
    fetch(this.state.secondSkeletonPath)
      .then(response => {
        bvhloader.load(this.state.secondSkeletonPath, result => {
          console.log("Second BVH Data:", result);
          const clip = result.clip;
          const duration = clip.duration; 
          console.log('Second BVH animation duration:', duration);
          resolve({ result, duration });
        });
      })
      .catch(error => {
        console.error("Error loading second BVH data:", error);
        reject(error);
      });
  });


      const loadbat = new Promise((resolve, reject) => {
        batloader.load(bat_model, model => {
            this.baseballBat = model.scene;
            const knob = new THREE.Mesh(new THREE.SphereGeometry(0.8), redMaterial);
            const end = new THREE.Mesh(new THREE.SphereGeometry(1), blueMaterial);
            knob.name = 'knob';
            end.name = 'end';
            this.baseballBat.add(knob);
            this.baseballBat.add(end);

            const knob_cord = 0;
            const end_cord = 15;
            knob.position.set(knob_cord, 0, 0);  
            end.position.set(end_cord, 0, 0);    
            virtualbat_length = knob_cord - end_cord;

            console.log("Knob and End added and baseballBat added to the scene");
            console.log("baseballBat structure:",this.baseballBat); // ?�X��? baseballBat ?�H�M��l?�H

            resolve(model);
        }, undefined, reject);
      });
      const loadbaseball = new Promise((resolve, reject) => {
          ballloader.load(basebaseball_model, resolve);
      });
      const loadBallMotion = new Promise((resolve, reject) => {
          try {
              const times = [];
              const positionValues = [];
              // load baseball motion (.json) file
              const myPromise = new Promise((resolve, reject) => {
                console.log("baseball_motion path:",this.state.baseball_motion);
                fetch(this.state.baseball_motion)
                    .then(response => response.json())
                    .then(data => resolve(data))
                    .catch(error => reject(error));
            });
            // show  ball motion path
            myPromise.then((baseball_motion) => {
              console.log("baseball_motion:",baseball_motion);
              const numFrames = baseball_motion.x.length;
              console.log("ball numFrames:",numFrames);
              console.log("ball fps :",this.state.motion_fps);
              
              for (let i = 0; i < numFrames; i++) {
                  times.push(i * 1 / this.state.motion_fps); 
                  // if not detected (-1) set valueto -1000
                  if (baseball_motion.x[i] == -1 & baseball_motion.y[i] == -1 & baseball_motion.z[i] == -1) {
                    baseball_motion.x[i] ,baseball_motion.y[i] ,baseball_motion.z[i] = -1000;
                  }
                  positionValues.push(
                      baseball_motion.z[i]*(50), 
                      baseball_motion.y[i]*(-50), 
                      baseball_motion.x[i]*(50)
                  );
                
              }
              const positionKF = new THREE.VectorKeyframeTrack('.position', times, positionValues);
              resolve(new THREE.AnimationClip('BaseballMovement', -1, [positionKF]));});    
              
          } catch (error) {
              console.error("Failed to process ball Motion:", error);
              reject(error);
          }
      });
      const loadBatMotion = new Promise((resolve, reject) => {
        try {
            const times = [];
            const knobPositions = [];
            const rotations = [];
            const myPromise = new Promise((resolve, reject) => {
              console.log("bat_motion path:",this.state.bat_motion);
                fetch(this.state.bat_motion)
                    .then(response => response.json())
                    .then(data => resolve(data))
                    .catch(error => reject(error));
            });
              
            myPromise.then((bat_motion) => {
              console.log("bat_motion:",bat_motion);
              const numFrames = bat_motion.end_x.length;
              console.log("bat numFrames:",numFrames);
              console.log("bat fps :",this.state.motion_fps);

            for (let i = 0; i < numFrames; i++) {
                times.push(i / this.state.motion_fps); 
                const knobPos = new THREE.Vector3(bat_motion.knob_z[i]*(50), bat_motion.knob_y[i]*(-50), bat_motion.knob_x[i]*(50));
                const endPos = new THREE.Vector3(bat_motion.end_z[i]*(50), bat_motion.end_y[i]*(-50), bat_motion.end_x[i]*(50));
                const knobToEnd = new THREE.Vector3().subVectors(endPos, knobPos).normalize();
                 // if not detected (-1) set valueto -1000
                // if (bat_motion.knob_x[i] == -1 & bat_motion.knob_y[i] == -1 & bat_motion.knob_z[i] == -1) {
                //   bat_motion.knob_x[i] ,bat_motion.knob_y[i] ,bat_motion.knob_z[i] = -1000;
                // }
                knobPositions.push(
                    bat_motion.knob_z[i]*(50),
                    bat_motion.knob_y[i]*(-50),
                    bat_motion.knob_x[i]*(50)
                );

                // 计算需要旋转的轴和角度
                const axis = new THREE.Vector3(1,0, 0); // 假设初始方向为y轴
                const angle = Math.acos(knobToEnd.dot(axis));
                const rotAxis = axis.cross(knobToEnd).normalize();
                // console.log("angle:", angle);
                // 存儲四元數旋轉到rotations数组
                const quaternion = new THREE.Quaternion().setFromAxisAngle(rotAxis, angle);
                rotations.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
            }
              

            const rotationKF = new THREE.QuaternionKeyframeTrack(".quaternion", times, rotations);
            const knobKF = new THREE.VectorKeyframeTrack(".knob.position", times, knobPositions);
            const batClip = new THREE.AnimationClip('BatMovement', -1, [rotationKF, knobKF]);
            resolve(batClip);
            })
              
            
        } catch (error) {
            console.error("Failed to process bat motion:", error);
            reject(error);
        }
});

      const onWindowResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
      }
      const init=()=>{
        const y_pos= 0;
          console.log("process.env.PUBLIC_URL",process.env.PUBLIC_URL);
          console.log("SKELTON:",this.state.skeleton_path);
          camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 5000 );
          // 獲取相機的位置和目標點，計算視線方向向量
          camera.position.set( 80, 70, 100 );
          camera.up.set( 1, 0, 0 );
          camera.lookAt( 1000, 0, 0 );
          // camera clip

          

          scene = new THREE.Scene();

          // grid view
          var gridHelper = new THREE.GridHelper(2000, 100);
          scene.add(gridHelper );
          gridHelper.rotation.z = -Math.PI / 2;
          // 可選：如果你想要 grid 在場景中的其他位置，可以調整其位置
          gridHelper.position.x = 0; // 調整 x 坐標位置
          //lower the grid line's alpha 
          gridHelper.material.opacity = 0.5;
          gridHelper.material.transparent = true;
          //adjust grid's y position
          gridHelper.position.y = y_pos+1;

          // grass plane view
          //add a grass texture as the ground at exact position of grid
          var texture = new THREE.TextureLoader().load( grass_texture );
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set( 5, 5 );
          var plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshLambertMaterial({map: texture}));
          plane.rotation.x = -Math.PI / 2;
          plane.position.y = y_pos;
          // scene.add(plane);
          

          // axis view (show xyz axis in the scene)
        
          var axesHelper = new THREE.AxesHelper( 100 );
          // 轉成
          axesHelper.rotation.y = Math.PI / 2;
          // axesHelper.scale.set(1, 1, 1);
          scene.add( axesHelper );

          // hemi light
          hemiLight = new THREE.AmbientLight(0x636363, 2);
          hemiLight.position.set(0, 200, 0);
          scene.add(hemiLight);

          // renderer
          renderer = new THREE.WebGLRenderer( { antialias: true } );
          renderer.setClearColor( 0xeeeeee );
          renderer.setPixelRatio( window.devicePixelRatio );
          renderer.setSize( window.innerWidth*2/3, window.innerHeight*2/3 );
          controls = new OrbitControls(camera, renderer.domElement);
          controls.autoRotate = false;
          controls.enable = false;
          // document.body.appendChild( renderer.domElement );
          document.getElementById("main").appendChild( renderer.domElement );
          
          window.addEventListener( 'resize', onWindowResize, false );
          controls = new OrbitControls( camera, renderer.domElement );

      }
      const animate=()=> {

          requestAnimationFrame( animate );

          var delta = clock.getDelta();
          var max = this.state.playbackMaxValue;
          var frame = this.state.frameNum;
          if ( mixer && secondMixer && ballmixer && batmixer && this.state.playbackIsPlay) {

            // console.log(mixer)
            mixer.update( delta );
            secondMixer.update( delta );
            ballmixer.update( delta );
            // console.log("Ball Position:", this.baseball.position);
            batmixer.update( delta );
            //knob and end position
            // console.log("Bat knob Position:", this.baseballBat.knob.position);
            // console.log("Bat end Position:", this.baseballBat.end.position);
            // console.log("Bat Position:", this.baseballBat.position);

            this.setState({playbackCurFrame: [0,mixer.time,max]});
            
            this.setState({frameNum: this.state.frameNum+3});
          }

          if (mixer && secondMixer&&ballmixer&&batmixer&& this.state.playbackCurFrame[1] >= this.state.playbackCurFrame[2] && this.state.playbackIsPlay) {
            this.setState({
              playbackIsPlay: false,
              playbackCurFrame: [0,0,max],
              frameNum: 0,
            });
            ballmixer.time = 0;
            batmixer.time = 0;  
            mixer.time = 0;
            secondMixer.time = 0;
          }

          renderer.render( scene, camera );
          controls.update();
          
      }      

      
        Promise.all([loadpose, loadSecondPose, loadbat, loadbaseball, loadBallMotion, loadBatMotion]).then(result => {
        var pose = result[0];
        var secondPose = result[1]; // Second BVH animation
        var batModel = result[2];
        var baseballModel = result[3];
        var baseballClip = result[4];
        var batClip = result[5];

        // Handling the first BVH animation
        const boneMaterial = new THREE.MeshStandardMaterial({ color: 0x28FF28, depthTest: true });
        skeletonHelper = new THREE.SkeletonHelper(pose.result.skeleton.bones[0]);
        skeletonHelper.skeleton = pose.result.skeleton;
        skeletonHelper.material = boneMaterial;
        var boneContainer = new THREE.Group();
        boneContainer.add(pose.result.skeleton.bones[0]);
        scene.add(skeletonHelper);
        scene.add(boneContainer);

        // Handling the second BVH animation
        const secondBoneMaterial = new THREE.MeshStandardMaterial({ color: 0xFF2828, depthTest: true });
        var secondSkeletonHelper = new THREE.SkeletonHelper(secondPose.result.skeleton.bones[0]);
        secondSkeletonHelper.skeleton = secondPose.result.skeleton;
        secondSkeletonHelper.material = secondBoneMaterial;
        var secondBoneContainer = new THREE.Group();
        secondBoneContainer.add(secondPose.result.skeleton.bones[0]);
        scene.add(secondSkeletonHelper);
        scene.add(secondBoneContainer);

        
        this.baseballBat = batModel.scene;  
        this.baseball = baseballModel.scene;
        
        if (this.state.currentSportType == 'batting') {
          // Handling the baseball bat
          this.baseballBat.scale.set(2, 2.5, 2);    
          this.baseballBat.rotation.set(0, 0, 90);
          scene.add(this.baseballBat); //sport switch
          scene.add(this.baseball);
          //for showing both baseball and bat
          // this.baseball.scale.set(1, 1, 1);     // Adjust scale as necessary
          // this.baseball.position.set(0, 0, 0);  // Adjust position as necessary
        }
        else if (this.state.currentSportType == 'pitching') {
          scene.add(this.baseball);
          this.baseball.scale.set(1, 1, 1);     // Adjust scale as necessary
          this.baseball.position.set(0, 0, 0);  // Adjust position as necessary
        }
        else if (this.state.currentSportType =='demo'){
          //skeleton loaded
          //load baseball 
          scene.add(this.baseball);
          this.baseball.scale.set(1, 1, 1);     // Adjust scale as necessary
          this.baseball.position.set(0, 0, 0);  // Adjust position as necessary
          //load baseball bat
          this.baseballBat.scale.set(2, 2.5, 2);    
          // this.baseballBat.rotation.set(0, 0, 90);
          scene.add(this.baseballBat); //sport switch
          console.log("aaaaaaaaaaaaaaaaaBaseball Bat added to the scene");
        }
        

        // Handling the baseball
        
        //load  position and play animation
        batmixer = new THREE.AnimationMixer(this.baseballBat);
        ballmixer = new THREE.AnimationMixer(this.baseball);
        const action = ballmixer.clipAction(baseballClip);
        const batAction = batmixer.clipAction(batClip); 
        action.play();
        batAction.play();

        console.log("Ball mixer time:", ballmixer.time);
        console.log("Bat mixer time:", batmixer.time);
        
        // console.log("Animation positions:", this.baseball.animation);

        // play animation
         // Play both animations
        mixer = new THREE.AnimationMixer(skeletonHelper);
        mixer.clipAction(pose.result.clip).setEffectiveWeight(1.0).play();

        secondMixer = new THREE.AnimationMixer(secondSkeletonHelper);
        secondMixer.clipAction(secondPose.result.clip).setEffectiveWeight(1.0).play();

        // console.log(this.baseball);
        this.setState({
          playbackMaxValue: Math.max(mixer._actions[0]._clip.duration, secondMixer._actions[0]._clip.duration),
        });
        this.animationMixer = mixer
        this.secondAnimationMixer = secondMixer;
        console.log("mixer action duration:",mixer._actions[0]._clip.duration);
        console.log("secondMixer action duration:",secondMixer._actions[0]._clip.duration);

      })
      
      init();
      animate(); 
      this.updateInternalState(this.props.sportType, this.props.fps);
    }
    
    render() {
      const { currentSportType } = this.state;
      return <React.Fragment>
        <div id="main" style={{marginLeft: "16%"}}></div>
        <div ref={this.containerRef}>
        
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
				</div>
        <div display="flex">
          
          
        </div>
        
      </React.Fragment>;
    }

    updateSpeed(speed) {
        // dummy function
    }

    playBackInterval(increase = 1, playActionNeeded = true) {
    // dummy function
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
     // dummy function
    }

    updateFramPosFromSlider(frameNumber) {
    const newFrame = this.state.playbackCurFrame;
    newFrame[1] = frameNumber;
    this.updateFramePos(newFrame);
    }

		updateFramePos(frame) {
    if (frame) {
      this.setState(
        {
          playbackCurFrame: frame,
          playbackIsPlay:
            this.state.playbackIsPlay &&
            (this.state.playbackIsLoop || frame[1] != frame[2]),
        },
      );
    }

    this.animationMixer.setTime(frame[1]);
    this.secondAnimationMixer.setTime(frame[1]); // Update second mixer time
    this.baseballMixer.setTime(frame[1]);
    this.batMixer.setTime(frame[1]);

    ActionRecordingActions.StorePlayerUpdateFrame(frame);
  }

   }

export default BaseballWorkspace;
