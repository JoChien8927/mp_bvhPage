import { useState, useEffect, useRef } from "react";
import * as THREE from "three/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from 'dat.gui'

export const Viewer = () => {
    const refContainer = useRef();
    const [loading, setLoading] = useState(true);
    const [renderer, setRenderer] = useState();

    // globals, modified from the above
    let at  = new THREE.Vector3();
    let eye = new THREE.Vector3();
    let up  = new THREE.Vector3();

    const cameraParams = {
      near: 0.1085,
      // far: 130.446001335,
      far: 13.0,
      fov: 75,                    // degrees?!       // from the dimensions of the canvas. see CSS
      atX: 0,
      atY: 0,
      atZ: 0,
      // eyeX: 1.99,
      // eyeY: 1.92,
      // eyeZ: 22.75,
      // eyeX: 0.0451,
      // eyeY: -0.0041,
      // eyeZ: 0.332,
      eyeX: 0,
      eyeY: 0,
      eyeZ: 0,
      // eyeX: 0.125,
      // eyeY: -0.015,
      upX: 0,
      upY: 1,
      upZ: 0
    };

    function buildScene(){
        const scene = new THREE.Scene()
        return scene
    }


    function setCameraView() {
      at.set( cameraParams.atX, cameraParams.atY, cameraParams.atZ );
      eye.set( cameraParams.eyeX, cameraParams.eyeY, cameraParams.eyeZ );
      up.set( cameraParams.upX, cameraParams.upY, cameraParams.upZ );
    }

    function buildRender(screenDimensions){
        const renderer= new THREE.WebGLRenderer({alpha: true});
        const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1
        renderer.setPixelRatio(DPR)
        renderer.setSize(screenDimensions.width, screenDimensions.height)

        return renderer
    }

    function buildCamera(screenDimensions){
        const aspectRatio = screenDimensions.width / screenDimensions.height
        const camera = new THREE.PerspectiveCamera()
        camera.aspect = aspectRatio
        camera.fov = 78
        camera.near   = cameraParams.near ||  5;  // measured from eye
        camera.far    = cameraParams.far  || 30;  // measured from eye
        // camera.rotateX(Math.PI/180 * 5)
        // camera.rotateY(Math.PI/180 * 63)
        // camera.rotateZ(Math.PI/180 * -31)

        // camera.rotateZ(Math.PI/180 * 4) //pitch
        // camera.rotateX(Math.PI/180 * (62))
        // camera.rotateY(Math.PI/180 * ( 64)) //yaw

        camera.rotateZ(Math.PI/180 * 63) //pitch
        camera.rotateX(Math.PI/180 * (90-64))
        camera.rotateY(Math.PI/180 * (4)) //yaw

        // camera.position.set(0.166, -0.475, 3.3)
        camera.position.set(0.475, -0.166, 3.3)

        // camera.rotateZ(Math.PI/180 * 4)
        // camera.rotateX(Math.PI/180 * 62)
        // camera.rotateY(Math.PI/180 * 64)

        camera.updateProjectionMatrix();

        // camera.rotation.z += 176
        // camera.rotation.x +=18
        // camera.rotation.y +-35
        // camera.lookAt(0,0,0)
        // camera.rotation._x = Math.PI / 180 * 90
        // camera.lookAt(1,0,0);
        // camera.updateProjectionMatrix();

        // camera.position.z = 1;
        // setCameraView();
        // camera.position.copy(eye);

        // Cameras inherit an "up" vector from Object3D.
        camera.up.copy(up);
        camera.lookAt(at);

        return camera
    }

    function createFloor(){
        const planeGeometry = new THREE.PlaneGeometry(10, 10, 10, 1);
        const texture = new THREE.TextureLoader().load(process.env.PUBLIC_URL + "/grid8.png");
        const planeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            map: texture,
            opacity: 0.9,
        });

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.receiveShadow = false;
        plane.position.set(0, 0, 0);
        return plane
    }

    function createGreenDot(){
      const geometry = new THREE.CircleGeometry( 0.05, 32 ); 
      const material = new THREE.MeshBasicMaterial( { color: 'green' } ); 
      const circle = new THREE.Mesh( geometry, material )
      circle.position.set(-0.5,-0.5, 0.002)
      // circle.position.z = 0.002
      return circle
    }

    function createAruco(){
        const aurcoPlaneGeometry = new THREE.PlaneGeometry(1,1,1);
        const aurcoTexture = new THREE.TextureLoader().load(process.env.PUBLIC_URL + "/aruco_42.png");
        const aurcoPlaneMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            map: aurcoTexture,
            opacity: 0.9,
        });

        const scale = new THREE.Vector3(-1,1,1)
        const arucoPlane = new THREE.Mesh(aurcoPlaneGeometry, aurcoPlaneMaterial);
        arucoPlane.scale.multiply(scale)

        arucoPlane.rotation.x = Math.PI /180 * 180;
        arucoPlane.rotation.z = Math.PI / 180 * 180

        arucoPlane.position.set(0, 0, 0.001);
        return arucoPlane
    }

    useEffect(() => {
      const { current: container } = refContainer;
      if (container && !renderer) {

        const screenDimensions = {
            width: container.clientWidth,
            height: container.clientHeight
        }
        const scene = buildScene()
        const renderer = buildRender(screenDimensions)
        container.appendChild(renderer.domElement);
        const camera = buildCamera(screenDimensions)
        const circle = createGreenDot() 

        const aspectRatio = screenDimensions.width / screenDimensions.height
        const worldCamera = new THREE.PerspectiveCamera()
        worldCamera.aspect = aspectRatio
        worldCamera.updateProjectionMatrix();
        worldCamera.position.z = 8


        const ambientLight = new THREE.AmbientLight(0xcccccc, 1);
        scene.add(ambientLight);

        const controls = new OrbitControls(worldCamera, renderer.domElement);
        controls.autoRotate = false;
        controls.enable = false;
        controls.maxDistance = 1000;
        controls.minDistance = 0;

        const floor = createFloor()
        const aurco = createAruco()

        var cameraHelper = new THREE.CameraHelper(camera);

        scene.add(floor)
        scene.add(aurco)
        scene.add(circle)
        scene.add(new THREE.AxesHelper());
        scene.add(cameraHelper)

        setLoading(false);

        let req = null;

        const animate = () => {
            req = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        // const gui = new GUI()
        // gui.add(cameraParams,'fov',1,179).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'aspectRatio',0.1,10).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'near',1,50).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'far',1,50).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'atX',-10,10).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'atY',-10,10).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'atZ',-10,10).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'eyeX',-10,10).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'eyeY',-10,10).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'eyeZ',-30,30).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'upX',-10,10).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'upY',-10,10).onChange(redo(renderer, camera, cameraHelper, scene));
        // gui.add(cameraParams,'upZ',-10,10).onChange(redo(renderer, camera, cameraHelper, scene));

        animate();
  
        return () => {
          cancelAnimationFrame(req);
          renderer.dispose();
        };
      }
    }, []);
  
    return (
      <div
        style={{ height: "100%", width: "100%", position: "relative" }}
        ref={refContainer}
      >
        {loading && (
          <span style={{ position: "absolute", left: "50%", top: "50%" }}>
            Loading...
          </span>
        )}
      </div>
    );
  };
