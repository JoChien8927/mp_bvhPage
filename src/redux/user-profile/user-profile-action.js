import {UserProfileTypes as UserProfileActionTypes} from "./user-profile-types";
import {UserPictureTypes as UserPictureActionTypes} from "./user-profile-types";
const UserProfileUpdateStart = (userId, userProfile) => ({
    type: UserProfileActionTypes.UPDATE_START,
    payload: {
        userId,
        userProfile
    }
})

const UserProfileUpdateFinish = (userProfile) => ({
    type: UserProfileActionTypes.UPDATE_FINISH,
    payload: {
        userProfile,
    }
})

export const UserProfileAction = {
    UserProfileUpdateStart,
    UserProfileUpdateFinish,
}

const UserPictureUpdateStart = (userId, userPicture) =>({
    type: UserPictureActionTypes.USER_PICTURE_UPDATE_START,
    payload: {
        userId: userId,
        userPicture: userPicture,
    },
});

const UserPictureUpdateFinish = (userPicture) =>({
    type: UserPictureActionTypes.USER_PICTURE_UPDATE_FINISH,
    payload: {
        userPicture: userPicture,
    }
})
export const UserPictureAction = {
    UserPictureUpdateStart,
    UserPictureUpdateFinish,
}