import { FriendsTypes } from "./friends-types";

const GetAddedStart = (userId, filter, sortBy) => ({
  type: FriendsTypes.ADDED_START,
  payload: {
    userId: userId,
    filter: filter,
    sortBy: sortBy,
  },
});

const GetAddedFinish = (userId, added) => ({
  type: FriendsTypes.ADDED_FINISH,
  payload: {
    userId: userId,
    added: added,
  },
});

const GetNotAddedStart = (userId) => ({
  type: FriendsTypes.NOT_ADDED_START,
  payload: {
    userId: userId,
  },
});

const GetNotAddedFinish = (notAdded) => ({
  type: FriendsTypes.NOT_ADDED_FINISH,
  payload: {
    notAdded: notAdded,
  },
});

const SendRequestStart = (userId, friendUserId) => ({
  type: FriendsTypes.SEND_REQUEST_START,
  payload: {
    userId: userId,
    friendUserId: friendUserId,
  },
});

const AcceptRequestStart = (userId, friendUserId) => ({
  type: FriendsTypes.ACCEPT_REQUEST_START,
  payload: {
    userId: userId,
    friendUserId: friendUserId,
  },
});

export const FriendsAction = {
  GetAddedStart,
  GetAddedFinish,
  GetNotAddedStart,
  GetNotAddedFinish,
  SendRequestStart,
  AcceptRequestStart,
};
