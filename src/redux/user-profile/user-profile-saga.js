import {getHeaders} from "../utils";
import { call, put, takeEvery } from "redux-saga/effects";
// import {call, put} from "redux-saga-test-plan/matchers";
import {UserProfileAction} from "./user-profile-action";
import {UserPictureAction} from "./user-profile-action";
import {UserPictureTypes, UserProfileTypes} from "./user-profile-types";

const UserProfileUpdateStart = function* (action) {
    const {userId, userProfile} = action.payload;
    const task = () => new Promise((resolve, reject) => {
        fetch(`/api/profile/${userId}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(userProfile)
        }).then(res => res.json())
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                console.log(err);
            });
    })
    const resUserProfile = yield call(task);

    yield put(UserProfileAction.UserProfileUpdateFinish(resUserProfile));
}

const UserPictureUpdateStart = function* (action) {
    const {userId, userPicture} = action.payload;

    const formData = new FormData();
    formData.append(
        "file",
        userPicture,
    );

    const upload_picture = () =>
        new Promise((resolve,reject) => {
            fetch("/api/users/" + userId + "/picture", {
                method: "POST",
                body: formData,
                headers: getHeaders(false),
            })
                .then((res) => res.json())
                .then((json) => {
                    resolve(json);
                })
                .catch((e) => {
                    console.log(e);
                });
        });
    const resUserPicture = yield call(upload_picture);
    yield put(UserPictureAction.UserPictureUpdateFinish(resUserPicture));
};

export const UserProfileSaga = function* () {
    yield takeEvery(UserProfileTypes.UPDATE_START, UserProfileUpdateStart);
    yield takeEvery(UserPictureTypes.USER_PICTURE_UPDATE_START, UserPictureUpdateStart);

}
