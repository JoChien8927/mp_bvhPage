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

import SKELETON from "../../assets/pitching/kpts_3d_pitching.bvh";
import video1 from "../../assets/pitching/cam1.mp4";
import video2 from "../../assets/pitching/cam2.mp4";
import video3 from "../../assets/pitching/cam3.mp4";
import video4 from "../../assets/pitching/cam4.mp4";
// import SKELETON from "../../assets/batting/kpts_3d_batting.bvh";
// import video1 from "../../assets/batting/cam1.mp4";
// import video2 from "../../assets/batting/cam2.mp4";
// import video3 from "../../assets/batting/cam3.mp4";
// import video4 from "../../assets/batting/cam4.mp4";


import bat_model from "../../assets/model/baseballbat.gltf";
import basebaseball_model from "../../assets/model/baseball/baseball.gltf";
import baseball_motion from "../../assets/motion/baseball_motion.json";
import bat_motion from "../../assets/motion/bat_motion.json";


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
      
    }
    
    
    updateSceneBasedOnSportType = () => {
    // ���u sportType ��s?��
    if (this.props.sportType === "pitching") {
        this.scene.remove(this.baseballBat); // �����y��
        this.scene.add(this.baseball);; // add baseball

    } else if (this.props.sportType === "batting") {
        this.scene.remove(this.baseball); // �����βy
        this.scene.add(this.baseballBat);; // add baseball
    } else {
        // �����Ҧ�
        this.scene.remove(this.baseball);
        this.scene.remove(this.baseballBat);
    }
    }

    componentDidMount=()=>{
    
      var clock = new THREE.Clock();

      var camera, controls, scene, renderer, hemiLight;
      var mixer, ballmixer, batmixer,skeletonHelper;
      var ballposition;

      var bvhloader = new BVHLoader();
      var batloader = new GLTFLoader();
      var ballloader = new GLTFLoader();
      var virtualbat_length = 0;
      // var textureloader = new TextureLoader();
      // var positionLoader = new npyjs();
      


      const loadpose =  new Promise((resolve, reject) => {
          // bvhloader.load( "/api/bvh/"+this.props.calibration_id +"/"+this.props.recording_id, resolve);		
          bvhloader.load(SKELETON,resolve);
          console.log("bvh skeleton loaded!",bvhloader.load(SKELETON, resolve));
          } );

      const loadbat = new Promise((resolve, reject) => {
        batloader.load(bat_model, model => {
            this.baseballBat = model.scene;

            // ?�� "knob" �M "end"
            const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });  // ?�����
            const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });  // ?�����
            const knob = new THREE.Mesh(new THREE.SphereGeometry(0.55), redMaterial);
            const end = new THREE.Mesh(new THREE.SphereGeometry(0.8), blueMaterial);
            knob.name = 'knob';
            end.name = 'end';
            this.baseballBat.add(knob);
            this.baseballBat.add(end);
            // scene.add(this.baseballBat);
            const knob_cord = -15; 
            const end_cord = 0.5;
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


      var fps = 30;
      var motion_fps = 120;
      var ratio = motion_fps / fps;


      const loadBallMotion = new Promise((resolve, reject) => {
          try {
              const times = [];
              const positionValues = [];
              const numFrames = baseball_motion.x.length;
              
              for (let i = 0; i < numFrames; i++) {
                // push it evey "ratio" frame
                  times.push(i * 1 / motion_fps); // Assuming 30 FPS
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

//       const loadBatMotion = new Promise((resolve, reject) => {
//     try {
//         const times = [];
//         const knobPositions = [];
//         const endPositions = [];
//         const numFrames = bat_motion.end_x.length;

//         for (let i = 0; i < numFrames; i++) {
//             times.push(i / motion_fps); 

//             endPositions.push(
//                 bat_motion.end_z[i]*50, 
//                 bat_motion.end_y[i]*50, 
//                 bat_motion.end_x[i]*50
//             );
           
//             knobPositions.push(
//                 bat_motion.knob_z[i]*50,
//                 bat_motion.knob_y[i]*50,
//                 bat_motion.knob_x[i]*50
//             );

//             // console.log("end position:", bat_motion.end_x[i], bat_motion.end_y[i], bat_motion.end_z[i])
//             // console.log("knob position:", bat_motion.knob_x[i], bat_motion.knob_y[i], bat_motion.knob_z[i])
//         }

//         const endKF = new THREE.VectorKeyframeTrack(".end.position", times, endPositions);
//         const knobKF = new THREE.VectorKeyframeTrack(".knob.position", times, knobPositions);
//         const batClip = new THREE.AnimationClip('BatMovement', -1, [endKF, knobKF]);
//         resolve(batClip);
//     } catch (error) {
//         console.error("Failed to process bat motion:", error);
//         reject(error);
//     }
// });

      const loadBatMotion = new Promise((resolve, reject) => {
    try {
        const times = [];
        const knobPositions = [];
        const endPositions = [];
        const numFrames = bat_motion.end_x.length;

        for (let i = 0; i < numFrames; i++) {
            times.push(i / motion_fps); 
            knobPositions.push(
                bat_motion.knob_z[i]*50,
                bat_motion.knob_y[i]*50,
                bat_motion.knob_x[i]*50
            );
            //get the end vector of knob -> end
            const vec_ke = new THREE.Vector3( (bat_motion.end_z[i]-bat_motion.knob_z[i])*50, 
                                            (bat_motion.end_y[i]-bat_motion.knob_y[i])*50, 
                                            (bat_motion.end_x[i]-bat_motion.knob_x[i])*50);
            const unit_vec_ke = vec_ke.normalize();

            endPositions.push(
                bat_motion.knob_z[i]*50 + unit_vec_ke.z * virtualbat_length,
                bat_motion.knob_y[i]*50 + unit_vec_ke.y * virtualbat_length,
                bat_motion.knob_x[i]*50 + unit_vec_ke.x * virtualbat_length
            );
            
            // console.log("end position:", bat_motion.end_x[i], bat_motion.end_y[i], bat_motion.end_z[i])
            // console.log("knob position:", bat_motion.knob_x[i], bat_motion.knob_y[i], bat_motion.knob_z[i])
        }

        const endKF = new THREE.VectorKeyframeTrack(".end.position", times, endPositions);
        const knobKF = new THREE.VectorKeyframeTrack(".knob.position", times, knobPositions);
        const batClip = new THREE.AnimationClip('BatMovement', -1, [endKF, knobKF]);
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
          camera.position.set( 0, 30, 200 );

          scene = new THREE.Scene();

          scene.add( new THREE.GridHelper( 200, 10 ) );

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
        // scene.add(this.baseballBat); //sport switch
        this.baseballBat.scale.set(3, 3, 3);    
        // this.baseballBat.rotation.set(0, 0, 90);
        
        
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

        //load bat position and play animation
        batmixer = new THREE.AnimationMixer(this.baseballBat);
        const batAction = batmixer.clipAction(batClip); 
        batAction.play();
        console.log("Bat Animation is playing:", batAction.isRunning());
        console.log("Bat mixer time:", batmixer.time);
        
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
