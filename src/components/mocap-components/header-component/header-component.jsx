import React from "react";
import "./header-component.scss";

export const MocapHeaderComponent = () => (
    <React.Fragment>
        <div className="mocapHeaderOutline">
          <img
            src={process.env.PUBLIC_URL + "/img/logo.svg"}
            width={30}
            height={30}
          />
          <span className="logo">
            SkelVision
          </span>
        </div>
    </React.Fragment>
);
