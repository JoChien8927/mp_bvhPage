import "./not-friend-feed-component.scss";
import React from "react";
import { ReactSVG } from "react-svg";

export default function NotFriendFeedComponent() {
  return (
    <div className={"not-feed-content"}>
      <div className={"feed-wrapper"}>
        <ReactSVG src={"/img/icon_lock.svg"} />
        <div className={"protected-title"}>Content Protected</div>
        <div className={"protected-description"}>
          Please add friends to browse their files or do pose comparisons
        </div>
      </div>
    </div>
  );
}
