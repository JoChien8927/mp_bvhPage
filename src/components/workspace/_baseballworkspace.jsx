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
import basebaseball_model from "../../assets/model/baseball/baseball.gltf";
import bat_motion from "../../assets/motion/empty_bat_motion.json";
import grass_texture from "../../assets/texture/ograss_tex.jpg";
import baseball_motion from "../../assets/motion/pitching/baseball_motion.json";

// var motion_fps = 120;
// import SKELETON from "../../assets/motion/pitching/kpts_3d_pitching.bvh";
// import video1 from "../../assets/motion/pitching/cam1.MP4";
// import video2 from "../../assets/motion/pitching/cam2.MP4";
// import video3 from "../../assets/motion/pitching/cam3.MP4";
// import video4 from "../../assets/motion/pitching/cam4.MP4";
// import baseball_motion from "../../assets/motion/pitching/baseball_motion_pitching.json";

var motion_fps = 30;
import SKELETON from "../../assets/motion/batting/kpts_3d_batting.bvh";
import video1 from "../../assets/motion/batting/cam1.mp4";
import video2 from "../../assets/motion/batting/cam2.mp4";
import video3 from "../../assets/motion/batting/cam3.mp4";
import video4 from "../../assets/motion/batting/cam4.mp4";
// import baseball_motion from "../../assets/motion/batting/baseball_motion_batting.json";
// import bat_motion from "../../assets/motion/batting/bat_motion.json";

// var motion_fps = 60;
// import SKELETON from "../../assets/motion/demo/kpts_3d_demo.bvh";
// import video1 from "../../assets/motion/demo/cam1.MP4";
// import video2 from "../../assets/motion/demo/cam2.MP4";
// import video3 from "../../assets/motion/demo/cam3.MP4";
// import video4 from "../../assets/motion/demo/cam4.MP4";
// import baseball_motion from "../../assets/motion/demo/baseball_motion_demo.json";






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
      };

      this.baseball = null;
      this.baseballBat = null;
      this.bbb =null;

      // this.ballTracePositions = [];
      // this.batEndTracePositions = [];
    }
    




    componentDidMount=()=>{
    
      var clock = new THREE.Clock();

      var camera, controls, scene, renderer, hemiLight;
      var mixer, ballmixer, batmixer,skeletonHelper;

      var bvhloader = new BVHLoader();
      var batloader = new GLTFLoader();
      var ballloader = new GLTFLoader();
      var virtualbat_length = 0;      
      const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });  
      const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });  



      const loadpose =  new Promise((resolve, reject) => {
          // bvhloader.load( "/api/bvh/"+this.props.calibration_id +"/"+this.props.recording_id, resolve);		
          bvhloader.load(SKELETON,resolve);
          console.log("bvh skeleton loaded!",bvhloader.load(SKELETON, resolve));
      } );
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
      const loadvideo = new Promise((resolve, reject) => {
        this.videoFirst.addEventListener('loadeddata', resolve);
        this.videoSecond.addEventListener('loadeddata', resolve);
        this.videoThird.addEventListener('loadeddata', resolve);
        this.videoFourth.addEventListener('loadeddata', resolve);
      });
      const loadBallMotion = new Promise((resolve, reject) => {
          try {
              const times = [];
              const positionValues = [];
              const numFrames = baseball_motion.x.length;
              
              for (let i = 0; i < numFrames; i++) {
                  times.push(i * 1 / motion_fps); 
                  positionValues.push(
                      baseball_motion.z[i]*50, 
                      baseball_motion.y[i]*50, 
                      baseball_motion.x[i]*50
                  );
                
              }
              const positionKF = new THREE.VectorKeyframeTrack('.position', times, positionValues);
              resolve(new THREE.AnimationClip('BaseballMovement', -1, [positionKF]));
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
            const numFrames = bat_motion.end_x.length;

            for (let i = 0; i < numFrames; i++) {
                times.push(i / motion_fps); 

                const knobPos = new THREE.Vector3(bat_motion.knob_z[i]*50, bat_motion.knob_y[i]*50, bat_motion.knob_x[i]*50);
                const endPos = new THREE.Vector3(bat_motion.end_z[i]*50, bat_motion.end_y[i]*50, bat_motion.end_x[i]*50);
                const knobToEnd = new THREE.Vector3().subVectors(endPos, knobPos).normalize();

                knobPositions.push(
                    bat_motion.knob_z[i]*50,
                    bat_motion.knob_y[i]*50,
                    bat_motion.knob_x[i]*50
                );
                //get the end vector of knob -> end


                // endPositions.push(
                //     bat_motion.knob_z[i]*50 + knobToEnd.z * virtualbat_length,
                //     bat_motion.knob_y[i]*50 + knobToEnd.y * virtualbat_length,
                //     bat_motion.knob_x[i]*50 + knobToEnd.x * virtualbat_length
                // );

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
          camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
          camera.position.set( 0, 50, 200 );

          scene = new THREE.Scene();

          scene.add( new THREE.GridHelper( 200, 10 ) );
          //lower the grid line's alpha 
          scene.children[0].material.opacity = 0.2;
          scene.children[0].material.transparent = true;
          //add a grass texture as the ground at exact position of grid
          var texture = new THREE.TextureLoader().load( grass_texture );
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set( 5, 5 );
          var plane = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshLambertMaterial({map: texture}));
          plane.rotation.x = -Math.PI / 2;
          plane.position.y = -0.5;
          scene.add(plane);
          //  show x yz axis in the scene
          var axesHelper = new THREE.AxesHelper( 100 );
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
          //trajectory
          // this.ballTracePositions = [];
          // this.batEndTracePositions = [];
          // this.ballTraceLine.geometry.attributes.position.needsUpdate = true;
          // this.batEndTraceLine.geometry.attributes.position.needsUpdate = true;

          
          window.addEventListener( 'resize', onWindowResize, false );
          controls = new OrbitControls( camera, renderer.domElement );

      }
      const animate=()=> {

          requestAnimationFrame( animate );

          var delta = clock.getDelta();
          var max = this.state.playbackMaxValue;
          var frame = this.state.frameNum;
          if ( mixer && ballmixer && batmixer && this.state.playbackIsPlay) {

            // console.log(mixer)
            mixer.update( delta );
            ballmixer.update( delta );
            // console.log("Ball Position:", this.baseball.position);
            batmixer.update( delta );
            //knob and end position
            // console.log("Bat knob Position:", this.baseballBat.knob.position);
            // console.log("Bat end Position:", this.baseballBat.end.position);
            console.log("Bat Position:", this.baseballBat.position);

            this.setState({playbackCurFrame: [0,mixer.time,max]});
            this.videoFirst.play();
            this.videoSecond.play();
            this.videoThird.play();
            this.videoFourth.play();


            this.setState({frameNum: this.state.frameNum+3});
          }

          if (mixer &&ballmixer&&batmixer&& this.state.playbackCurFrame[1] >= this.state.playbackCurFrame[2] && this.state.playbackIsPlay) {
            this.setState({
              playbackIsPlay: false,
              playbackCurFrame: [0,0,max],
              frameNum: 0,
            });
            ballmixer.time = 0;
            batmixer.time = 0;  
            mixer.time = 0;
            this.videoFirst.currentTime = 0;
            this.videoSecond.currentTime = 0;
            this.videoThird.currentTime = 0;
            this.videoFourth.currentTime = 0;

            this.videoFirst.pause();
            this.videoSecond.pause();
            this.videoThird.pause();
            this.videoFourth.pause();
            
          }
          // if (this.baseball && this.baseballBat) {
          //   const ballPos = new THREE.Vector3().setFromMatrixPosition(this.baseball.matrixWorld);
          //   const batEndPos = new THREE.Vector3().setFromMatrixPosition(this.baseballBat.end.matrixWorld);

          //   this.ballTracePositions.push(ballPos.x, ballPos.y, ballPos.z);
          //   this.batEndTracePositions.push(batEndPos.x, batEndPos.y, batEndPos.z);

          //   this.ballTraceLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.ballTracePositions, 3));
          //   this.ballTraceLine.geometry.attributes.position.needsUpdate = true;

          //   this.batEndTraceLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.batEndTracePositions, 3));
          //   this.batEndTraceLine.geometry.attributes.position.needsUpdate = true;
          // }

         
          renderer.render( scene, camera );
          controls.update();
          
      }      
      Promise.all([loadpose, loadvideo,loadbat,loadbaseball,loadBallMotion,loadBatMotion]).then((result)=>{
        var pose=result[0];
        var video=result[1];
        var batModel=result[2];
        var baseballModel=result[3];
        var baseballClip = result[4]; // This is the AnimationClip we created above
        var batClip = result[5];
        // console.log(result);
        skeletonHelper = new THREE.SkeletonHelper( pose.skeleton.bones[ 0 ] );
        skeletonHelper.skeleton = pose.skeleton; // allow animation mixer to bind to SkeletonHelper directly

        var boneContainer = new THREE.Group();
        boneContainer.add( pose.skeleton.bones[ 0 ] );

        scene.add( skeletonHelper );
        scene.add( boneContainer );
        
        // Handling the baseball bat
        this.baseballBat = batModel.scene;  
        scene.add(this.baseballBat); //sport switch￼
        this.baseballBat.scale.set(3, 3, 3);    
        this.baseballBat.rotation.set(0, 0, 90);
        batmixer = new THREE.AnimationMixer(this.baseballBat);
        // bbb use the same model as baseball bat but not controled by mixer


        // this.bbb = this.baseballBat.clone();
        // scene.add(this.bbb);

        const batAction = batmixer.clipAction(batClip); 
        batAction.play();
        console.log("Bat mixer time:", batmixer.time);
        

        // Handling the baseball
        this.baseball = baseballModel.scene;
        scene.add(this.baseball);
        this.baseball.scale.set(1, 1, 1);     // Adjust scale as necessary
        this.baseball.position.set(0, 0, 0);  // Adjust position as necessary
        //load baseball position and play animation
        ballmixer = new THREE.AnimationMixer(this.baseball);
        const action = ballmixer.clipAction(baseballClip);
        action.play();
        console.log("Ball mixer time:", ballmixer.time);

        
        // console.log("Animation positions:", this.baseball.animation);

        // play animation
        mixer = new THREE.AnimationMixer( skeletonHelper );
        mixer.clipAction( pose.clip ).setEffectiveWeight( 1.0 ).play();

        var position = [];
        for (var i = 0; i < 684; i++) {
          position.push(i);
        }

        
        // console.log(this.baseball);
        this.setState({
          playbackMaxValue: mixer._actions[0]._clip.duration,
        });
        this.animationMixer = mixer
        this.videoFirst.currentTime = 0;
        this.videoSecond.currentTime = 0;
        this.videoThird.currentTime = 0;
        this.videoFourth.currentTime = 0;

        console.log("mixer action duration:",mixer._actions[0]._clip.duration);
        console.log("1st Video duration:",this.videoFirst.duration)
      })

      init();
      //trajectory 
      // const traceMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      // const traceGeometry = new THREE.BufferGeometry();

      // this.ballTraceLine = new THREE.Line(traceGeometry, traceMaterial);
      // this.batEndTraceLine = new THREE.Line(traceGeometry.clone(), traceMaterial);

      scene.add(this.ballTraceLine);
      scene.add(this.batEndTraceLine);
      animate(); 
      
    }
    
    render() {
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
          
          <video width="25%" height="240" muted={false} ref={player=>(this.videoFirst=player)}>
            <source src={video1} />
          </video>
          <video width="25%" height="240" muted={false} ref={player=>(this.videoSecond=player)}>
            <source src={video2} />
          </video>
          <video width="25%" height="240" muted={false} ref={player=>(this.videoThird=player)}>
            <source src={video3} />
          </video>
          <video width="25%" height="240" muted={false} ref={player=>(this.videoFourth=player)}>
            <source src={video4} />
          </video>
          
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

        if (!playbackIsPlay) {
          this.videoFirst.pause();
          this.videoSecond.pause();
          this.videoThird.pause();
          this.videoFourth.pause();
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
			if (frame)
				this.setState(
					{
						playbackCurFrame: frame,
						playbackIsPlay:
							this.state.playbackIsPlay &&
							(this.state.playbackIsLoop || frame[1] != frame[2]),
					},
				);
			
			this.animationMixer.setTime(frame[1]);
      this.baseballMixer.setTime(frame[1]);
      this.batMixer.setTime(frame[1]);
      this.videoFirst.currentTime = frame[1]*this.videoFirst.playbackRate;
      this.videoSecond.currentTime = frame[1]*this.videoSecond.playbackRate;
      this.videoThird.currentTime = frame[1]*this.videoThird.playbackRate;
      this.videoFourth.currentTime = frame[1]*this.videoFourth.playbackRate;
	
			ActionRecordingActions.StorePlayerUpdateFrame(frame);
		}

   }

export default BaseballWorkspace;
