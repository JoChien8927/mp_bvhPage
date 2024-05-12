import React from 'react';
import * as THREE from 'three';

const BaseballBat = ({ topHeight, bottomHeight }) => {
  const batGroupRef = React.useRef(null);

  React.useEffect(() => {
    const batGroup = batGroupRef.current;
    const barrelGeometry = new THREE.CylinderGeometry(0.2, 0.04, topHeight - bottomHeight, 32, 1, true);
    const barrelMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.set(0, (topHeight - bottomHeight) / 2 + bottomHeight, 0);
    batGroup.add(barrel);

    const diskGeometry = new THREE.CylinderGeometry(0.14, 0.14, 0.15, 32);
    const diskMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.position.set(0, bottomHeight, 0);
    batGroup.add(disk);
  }, [topHeight, bottomHeight]);

  return <group ref={batGroupRef} />;
};

export default BaseballBat;
