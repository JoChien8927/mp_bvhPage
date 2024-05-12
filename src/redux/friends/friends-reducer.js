import { FriendsTypes } from "./friends-types";
import { createReducer } from "../utils";

const initialState = {
  added: [],
  notAdded: [],
};

const GetAddedFinish = (state, payload) => {
  const added = payload.added.map((friend) => {
    const friendRequest =
      friend.originUser._id == payload.userId
        ? friend.targetUser
        : friend.originUser;

    friendRequest.sendBy = friend.originUser._id;
    friendRequest.status = friend.status;
    friendRequest.createdAt = friend.createdAt;
    friendRequest.updatedAt = friend.updatedAt;

    return friendRequest;
  });

  return {
    ...state,
    added: added,
  };
};

const GetNotAddedFinish = (state, payload) => {
  return {
    ...state,
    notAdded: payload.notAdded,
  };
};

export const FriendsReducer = createReducer(initialState, {
  [FriendsTypes.ADDED_FINISH]: GetAddedFinish,
  [FriendsTypes.NOT_ADDED_FINISH]: GetNotAddedFinish,
});
