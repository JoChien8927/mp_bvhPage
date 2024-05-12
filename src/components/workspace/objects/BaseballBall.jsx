import React from 'react';
import * as THREE from 'three';

const BaseballBall = ({ position }) => {
  const ballRef = React.useRef(null);

  React.useEffect(() => {
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);

    ball.position.copy(position);
    ballRef.current = ball;

    return () => {
      ballGeometry.dispose();
      ballMaterial.dispose();
    };
  }, [position]);

  return <primitive object={ballRef.current} />;
};

export default BaseballBall;
