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

// const { dataType } = this.props;

import SKELETON from "../../assets/pitching/kpts_3d_pitching.bvh";
import video1 from "../../assets/pitching/cam1.mp4";
import video2 from "../../assets/pitching/cam2.mp4";
import video3 from "../../assets/pitching/cam3.mp4";
import video4 from "../../assets/pitching/cam4.mp4";
import bat_model from "../../assets/model/baseballbat.gltf";
import basebaseball_model from "../../assets/model/baseball/baseball.gltf";
import baseball_motion from "../../assets/motion/baseball_motion.json";



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
    
    componentDidUpdate(prevProps) {
    // check sportType change
    if (prevProps.sportType !== this.props.sportType) {
        this.updateSceneBasedOnSportType();
        console.log("sportType changed!");
    }
    } 
    updateSceneBasedOnSportType = () => {
    // 根据 sportType 更新?景
    if (this.props.sportType === "pitching") {
        this.scene.remove(this.baseballBat); // 移除球棒
        this.scene.add(this.baseball);; // add baseball

    } else if (this.props.sportType === "batting") {
        this.scene.remove(this.baseball); // 移除棒球
        this.scene.add(this.baseballBat);; // add baseball
    } else {
        // 移除所有
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
      // var textureloader = new TextureLoader();
      // var positionLoader = new npyjs();
      


      const loadpose =  new Promise((resolve, reject) => {
          // bvhloader.load( "/api/bvh/"+this.props.calibration_id +"/"+this.props.recording_id, resolve);		
          bvhloader.load(SKELETON,resolve);
          console.log("bvh skeleton loaded!",bvhloader.load(SKELETON, resolve));
          } );
      
      const loadbat = new Promise((resolve, reject) => {
        batloader.load(bat_model,resolve);
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


      // const loadBallMotion = new Promise((resolve, reject) => {
      //     try {
      //         const times = [];
      //         const positions = [];
      //         const numFrames = baseball_motion.x.length; //  baseball_motion (.json) 

      //         for (let i = 0; i < numFrames; i++) {
      //             times.push(i * 1 / 30); // Assuming 30 FPS
      //             positions.push([
      //                 baseball_motion.x[i] * 10, 
      //                 baseball_motion.y[i] * 10, 
      //                 baseball_motion.z[i] * 10
      //             ]);
      //         }
      //         console.log("baseball_motion loaded",baseball_motion)
      //         resolve({ times, positions }); // Resolve with the calculated times and positions
      //     } catch (error) {
      //         console.error("Failed to process ball Motion:", error);
      //         reject(error);
      //     }
      // });
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
                      baseball_motion.x[i] * 10, 
                      baseball_motion.y[i] * 10, 
                      baseball_motion.z[i] * 10
                  );
                
              }
              const positionKF = new THREE.VectorKeyframeTrack('.position', times, positionValues);
              resolve(new THREE.AnimationClip('BaseballMovement', -1, [positionKF]));
          } catch (error) {
              console.error("Failed to process ball Motion:", error);
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

          // hemiLight = new THREE.AmbientLight(0x636363, 1);
          // hemiLight.position.set(0, 200, 0);
          // scene.add(hemiLight);
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
          if ( mixer && ballmixer && this.state.playbackIsPlay) {

            // console.log(mixer)
            mixer.update( delta );
            ballmixer.update( delta );
            this.setState({playbackCurFrame: [0,mixer.time,max]});
            this.videoFirst.play();
            this.videoSecond.play();
            this.videoThird.play();
            this.videoFourth.play();
            
            //baseball bat position
            this.baseballBat.position.set(0,0,0);

            this.setState({frameNum: this.state.frameNum+3});
          }

          if (mixer &&ballmixer&& this.state.playbackCurFrame[1] >= this.state.playbackCurFrame[2] && this.state.playbackIsPlay) {
            this.setState({
              playbackIsPlay: false,
              playbackCurFrame: [0,0,max],
              frameNum: 0,
            });
            ballmixer.time = 0;
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
    

      
      Promise.all([loadpose, loadvideo,loadbat,loadbaseball,loadBallMotion]).then((result)=>{
        var pose=result[0];
        var video=result[1];
        var batModel=result[2];
        var baseballModel=result[3];
        // var baseballMotion=result[4];
        var baseballClip = result[4]; // This is the AnimationClip we created above
            
        // console.log(result);
        skeletonHelper = new THREE.SkeletonHelper( pose.skeleton.bones[ 0 ] );
        skeletonHelper.skeleton = pose.skeleton; // allow animation mixer to bind to SkeletonHelper directly

        var boneContainer = new THREE.Group();
        boneContainer.add( pose.skeleton.bones[ 0 ] );

        scene.add( skeletonHelper );
        scene.add( boneContainer );

        
        // if (this.props.sportType === "pitching") {
        //     scene.add(this.baseball);; // add baseball
        //     console.log("sportType:",this.props.sportType);
        //     console.log("baseball added!");
        //   } else if (this.props.sportType === "batting") {
        //       scene.add(this.baseballBat);// 添加球棒
        //       console.log("sportType:",this.props.sportType);
        //       console.log("bat added!");
        //   }
        
        // Handling the baseball bat
        this.baseballBat = batModel.scene;  // Assuming the GLTF model's scene is what you need
        scene.add(this.baseballBat);
        this.baseballBat.position.set(1000, 1000, 1000);  // Set position as needed
        this.baseballBat.rotation.set(0, 90, 90);  // Set rotation as needed
        this.baseballBat.scale.set(3, 3, 3);     // Set scale as needed
        
        
        // Handling the baseball
        this.baseball = baseballModel.scene;
        scene.add(this.baseball);
        this.baseball.scale.set(1, 1, 1);     // Adjust scale as necessary
        
        //load baseball position and play animation
        // this.baseball.animation = baseballMotion.positions
        ballmixer = new THREE.AnimationMixer(this.baseball);
        const action = ballmixer.clipAction(baseballClip);
        action.play();

        
        console.log("Ball mixer time:", ballmixer.time);
        // console.log("Animation positions:", this.baseball.animation);

        // play animation
        mixer = new THREE.AnimationMixer( skeletonHelper );
        mixer.clipAction( result[0].clip ).setEffectiveWeight( 1.0 ).play();

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
        // mixer.timeScale = this.state.playbackMaxValue / this.videoFirst.duration;
        
        console.log("mixer action duration:",mixer._actions[0]._clip.duration);
        console.log("1st Video duration:",this.videoFirst.duration)
        // this.videoFirst.playbackRate = this.videoFirst.duration / mixer._actions[0]._clip.duration;
        // this.videoSecond.playbackRate = this.videoSecond.duration / mixer._actions[0]._clip.duration;
        // this.videoThird.playbackRate = this.videoThird.duration / mixer._actions[0]._clip.duration;
        // this.videoFourth.playbackRate = this.videoFourth.duration / mixer._actions[0]._clip.duration;


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
