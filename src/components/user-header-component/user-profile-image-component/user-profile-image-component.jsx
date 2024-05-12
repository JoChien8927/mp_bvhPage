import {Modal, Upload} from "antd";
import Grid from "@material-ui/core/Grid";
import {UploadOutlined} from "@ant-design/icons";
import React from "react";
import "./user-profile-image-component.scss"
import ImgCrop from "antd-img-crop";

export default function UserProfileImage({ onUpdate, user }) {
    const [uploadUserPictureModal, setUploadUserPictureModal] = React.useState(false);
    const [newUserPicture, setNewUserPicture] = React.useState([]);

    const onPreview = async (file) => {
        let src = file.url;
        if (!src && file.originFileObj) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        if (src) {
            const imgWindow = window.open(src);
            imgWindow?.document.write(`<img src="${src}" alt="Preview" />`);
        }
    };


    const onChange = ({ fileList: newFileList }) => {};

    const onUploadFile = async (event) => {
        const fileData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(event.file);
            reader.onload = () => resolve(reader.result);
        });

        const updatedUserPicture = [
            {
                uid: event.file.uid,
                name: event.file.name,
                status: "done",
                url: fileData,
                fileType: event.file.name.toLowerCase().split('.').slice(-1)[0],
            },
        ];

        setNewUserPicture(updatedUserPicture);
    };


    const onRemovePhoto = () => {
        setNewUserPicture([]);
    };

    const fileList = newUserPicture || [];

    return (
        <>
            <div
                className="user-picture"
                onClick={() => {
                    setUploadUserPictureModal(true);
                    setNewUserPicture([]);
                }}
                style={{
                    backgroundImage: `url(${
                        user.photoFile
                            ? process.env.PUBLIC_URL +
                            '/api/files/profile-photos/' +
                            user.photoFile
                            : '/img/user_example.png'
                    })`,
                }}
            ></div>
            <Modal
                centered={true}
                maskClosable={true}
                destroyOnClose={true}
                title="Update User Picture"
                open={uploadUserPictureModal}
                okText="Save"
                onOk={() => {
                    onUpdate();
                    setUploadUserPictureModal(false);
                }}
                onCancel={() => {
                    setUploadUserPictureModal(false);
                    setNewUserPicture([]);
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={8} md={9}>
                        <ImgCrop rotate>
                            <Upload
                                listType="picture-card"
                                customRequest={onUploadFile}
                                accept=".jpg,.jpeg,.png"
                                maxCount={1}
                                fileList={fileList}
                                onPreview={onPreview}
                                onRemove={onRemovePhoto}
                            >
                                <UploadOutlined /> Upload
                            </Upload>
                        </ImgCrop>
                    </Grid>
                </Grid>
            </Modal>
        </>
    );
}
