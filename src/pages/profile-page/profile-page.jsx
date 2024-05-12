import "./profile-page.scss";
import { MainHeaderComponent } from "../../components/main-header-component/main-header-component";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import FriendFeedComponent from "./friend-feed-component/friend-feed-component";
import NotFriendFeedComponent from "./not-friend-feed-component/not-friend-feed-component";
import FriendHeaderComponent from "./friend-header-component/friend-header-component";
import NotFriendHeaderComponent from "./not-friend-header-component/not-friend-header-component";

export function ProfilePage() {
  const { username } = useParams();
  const [isFriend, setIsFriend] = useState(false);
  return (
    <div className={"profile-page"}>
      <div className={"header"}>
        <MainHeaderComponent headerKey={0} />
      </div>
      {isFriend ? (
        <>
          <FriendHeaderComponent />
          <FriendFeedComponent />
        </>
      ) : (
        <>
          <NotFriendHeaderComponent />
          <NotFriendFeedComponent />
        </>
      )}
    </div>
  );
}
