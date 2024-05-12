import { ReactSVG } from "react-svg";
import React from "react";
import "./not-friend-header-component.scss";

export default function NotFriendHeaderComponent() {
  return (
    <div className="user-info">
      <img src="https://i.pravatar.cc/300" className="avatar" alt={""} />
      <div className={"display-name"}>Calvin Ku</div>
      <div className={"username"}>@calvinku1209</div>
      <div className="last-login">Last login on Jan 26, 2022</div>
      <div className="keywords">Basketball | Tennis | Player</div>
      <div className="add-friend-btn">
        <ReactSVG
          src="/img/icon_plus.svg"
          beforeInjection={(svg) => {
            svg.children[0].setAttribute("fill", "rgb(53, 118, 167)");
          }}
        />
        <span className="add-friend-btn-text">Add Friend</span>
      </div>
    </div>
  );
}
