import {UserProfileTypes} from "./user-profile-types";
import {UserPictureTypes} from "./user-profile-types";
import {createReducer} from "../utils";

const initialState = {
    userProfile: {},
    userPicture: {},
}

const UserProfileUpdateFinish = (state, payload) => ({
    ...state,
    userProfile: payload.userProfile,
})

const UserProfileReducer = createReducer(initialState, {
    [UserProfileTypes.UPDATE_FINISH]: UserProfileUpdateFinish,
})

const UserPictureUpdateFinish = (state, payload) => ({
    ...state,
    userPicture: payload.userPicture,
})

const UserPictureReducer = createReducer(initialState, {
    [UserPictureTypes.USER_PICTURE_UPDATE_FINISH]: UserPictureUpdateFinish,
})