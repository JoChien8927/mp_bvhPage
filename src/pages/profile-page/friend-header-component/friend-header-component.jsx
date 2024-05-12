import "./friend-header-component.scss";
import React from "react";

export default function FriendHeaderComponent() {
  return (
    <div className="not-user-info">
      <div className="user-profile-about">
        <div className="profile">
          <img src="https://i.pravatar.cc/300" className="avatar" alt={""} />
          <div className={"info"}>
            <div className={"name-and-edit"}>
              <div className={"name"}>Calvin Ku</div>
              <div className={"edit-profile-btn"}>Edit profile</div>
            </div>
            <div className={"username"}>@calvinku1209</div>
            <div className={"about-him"}>
              40 Friends ‧ 20 Analysis ‧ 12 Teams
            </div>
            <div className="keywords">
              <div className={"keyword-tag"}>#player</div>
              <div className={"keyword-tag"}>#basketball</div>
              <div className={"keyword-tag"}>#table_tennis</div>
            </div>
          </div>
        </div>
        <div className="about">
          <div className="about-title">About</div>
          <div className="about-description">
            I enjoy playing and learning new sports during my lesiure time and
            had master many sports including: tennis, fencing, football,
            basketball, and swimming. My love for sports makes me passionate
            about my research in new innovative sports technologies.
          </div>
        </div>
      </div>
      <div className="user-profile-stats">
        <div className="title">
          <div className={"tag-list"}>
            <div className="tag active">Progress</div>
            <div className="tag">Progress</div>
            <div className="tag">Progress</div>
          </div>
          <div className="read-more-btn">Read more</div>
        </div>
        <div className="stat"></div>
      </div>
    </div>
  );
}
