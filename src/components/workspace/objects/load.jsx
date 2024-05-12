import React from 'react';
import BaseballBall from './BaseballBall';
import BaseballBat from './BaseballBat';

export default function App() {
  const ballPosition = { x: 0, y: 0, z: 0 };
  const batTopHeight = 2;
  const batBottomHeight = 1;

  return (
      <div>
        <div>
          <BaseballBall position={ballPosition} />
        </div>
        <div>
          <BaseballBat topHeight={batTopHeight} bottomHeight={batBottomHeight} />
        </div>
      </div>
  );
}
