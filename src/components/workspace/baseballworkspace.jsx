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

//custom 
import { loadPose, loadSecondPose, loadBat, loadBaseball, loadBallMotion, loadBatMotion } from './items/itemloader';





class BaseballWorkspace extends React.Component {
    constructor(props) {
      super(props);
      this.containerRef = React.createRef();
			
      //animation mixer 
			this.animationMixer = null;
      this.secondAnimationMixer = null;
      this.baseballMixer = null;  
      this.batMixer = null;

      //model 
      this.baseball = null;
      this.baseballBat = null;

      //state
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

    }

    componentDidUpdate(prevProps) {
      // 檢查 sportType 或 fps 是否有變化
      if (prevProps.sportType !== this.props.sportType || prevProps.fps !== this.props.fps) {
        this.updateInternalState(this.props.sportType, this.props.fps);
      }
    }
    updateInternalState = (sportType, fps) => {
      const newState = {
        currentSportType: sportType,
        skeleton_path: `${process.env.PUBLIC_URL}/exp/${sportType}/kpts_3d_${sportType}.bvh`,
        motion_fps: fps,
      };

      if (sportType === 'pitching') {
        newState.bat_motion = `${process.env.PUBLIC_URL}/exp/empty/bat_motion.json`;
        newState.baseball_motion = `${process.env.PUBLIC_URL}/exp/${sportType}/baseball_motion.json`;
      } else if (sportType === 'batting') {
        newState.bat_motion = `${process.env.PUBLIC_URL}/exp/${sportType}/bat_motion.json`;
        newState.baseball_motion = `${process.env.PUBLIC_URL}/exp/empty/baseball_motion.json`;
      } else if (sportType === 'demo') {
        newState.bat_motion = `${process.env.PUBLIC_URL}/exp/demo/bat_motion.json`;
        newState.baseball_motion = `${process.env.PUBLIC_URL}/exp/demo/baseball_motion.json`;
      } else {
        newState.bat_motion = `${process.env.PUBLIC_URL}/exp/empty/bat_motion.json`;
        newState.baseball_motion = `${process.env.PUBLIC_URL}/exp/demo/baseball_motion.json`;
      }

      this.setState(newState);
    }
    componentDidMount=()=>{
      const onWindowResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
      }
      

      console.log("Component mounted with sportType:", this.state.currentSportType);
      var clock = new THREE.Clock();
      var camera, controls, scene, renderer, hemiLight;
      var mixer,secondMixer, ballmixer, batmixer,skeletonHelper;

      const init=()=>{
        const y_pos= 0;
          console.log("process.env.PUBLIC_URL",process.env.PUBLIC_URL);

          camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 5000 ); 
          camera.position.set( 80, 70, 100 );
          camera.up.set( 1, 0, 0 );
          camera.lookAt( 1000, 0, 0 );

          //init scene
          scene = new THREE.Scene();

          // axis view (show xyz axis in the scene)
          var axesHelper = new THREE.AxesHelper( 100 );
          axesHelper.rotation.y = Math.PI / 2;
          axesHelper.scale.set(1, 1, 1);
          scene.add( axesHelper );

          // hemi light
          hemiLight = new THREE.AmbientLight(0x636363, 2);
          hemiLight.position.set(0, 200, 0);
          scene.add(hemiLight);

          // grid view
          var gridHelper = new THREE.GridHelper(2000, 100);
          scene.add(gridHelper );
          gridHelper.rotation.z = -Math.PI / 2;
          gridHelper.position.x = 0; 
          gridHelper.material.opacity = 0.5;
          gridHelper.material.transparent = true;
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
          
          //ball trajectory
          this.ballPath = [];
          this.ballPathMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 , linewidth: 5});
          this.ballPathGeometry = new THREE.BufferGeometry().setFromPoints(this.ballPath);
          this.ballPathLine = new THREE.Line(this.ballPathGeometry, this.ballPathMaterial);
          // scene.add(this.ballPathLine);

          //bat trajectory
          this.batPath = [];
          this.batPathMaterial = new THREE.LineBasicMaterial({ color: 0x28FF28 , linewidth: 5});
          this.batPathGeometry = new THREE.BufferGeometry().setFromPoints(this.ballPath);
          this.batPathLine = new THREE.Line(this.batPathGeometry, this.batPathMaterial);
          // scene.add(this.batPathLine);
          


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
            // if all mixer exist ,then play the animation
            mixer.update( delta );
            secondMixer.update( delta );
            ballmixer.update( delta );
            batmixer.update( delta );
            this.setState({playbackCurFrame: [0,mixer.time,max]});
            this.setState({frameNum: this.state.frameNum+3});


            //record the current ball position to make trajectory
            // update trajectory
            //ball
            if(this.baseball.position.x>-10000){ //filer the undetect ball (-1)=> (-1000)*50
              this.ballPath.push(this.baseball.position.clone());}
            this.ballPathGeometry.setFromPoints(this.ballPath);
            this.ballPathGeometry.attributes.position.needsUpdate = true;
            // //bat
            //get the end point of bat
            this.batEnd = this.baseballBat.getObjectByName('end');
             if (this.batEnd) {
                const batEndWorldPosition = new THREE.Vector3();
                this.batEnd.getWorldPosition(batEndWorldPosition);
                if (batEndWorldPosition.x<80)
                  {this.batPath.push(batEndWorldPosition.clone());}
                console.log("End World Position:", batEndWorldPosition);
            }
          
            this.batPathGeometry.setFromPoints(this.batPath);
            this.batPathGeometry.attributes.position.needsUpdate = true;
            
          }

          if (mixer && secondMixer&&ballmixer&&batmixer&& this.state.playbackCurFrame[1] >= this.state.playbackCurFrame[2] && this.state.playbackIsPlay) {
            // if .. exist,and the playtime exceeds the maximum of animation,then set the time to 0 
            this.setState({
              playbackIsPlay: false,
              playbackCurFrame: [0,0,max],
              frameNum: 0,
            });
            ballmixer.time = 0;
            batmixer.time = 0;  
            mixer.time = 0;
            secondMixer.time = 0;


            //reset the trajectory
            this.ballPath=[]
            this.ballPathGeometry.attributes.position.needsUpdate = true;
            this.batPath =[]
            this.batPathGeometry.attributes.position.needsUpdate = true;
          }

          renderer.render( scene, camera );
          controls.update();
          
      }      

      
      //loading all of the data
      Promise.all([
        loadPose(this.state.skeleton_path),
        loadPose(this.state.secondSkeletonPath),
        loadBat(bat_model),
        loadBaseball(basebaseball_model),
        loadBallMotion(this.state.baseball_motion, this.state.motion_fps),
        loadBatMotion(this.state.bat_motion, this.state.motion_fps)
        ])
        .then(result =>{
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
        
        
        //skeleton loaded
        //load baseball 
        scene.add(this.baseball);
        this.baseball.scale.set(1, 1, 1);     // Adjust scale as necessary
        this.baseball.position.set(0, 0, 0);  // Adjust position as necessary
        //load baseball bat
        this.baseballBat.scale.set(2, 2.5, 2);    
        // this.baseballBat.rotation.set(0, 0, 90);
        // scene.add(this.baseballBat); //sport switch
        
        

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
