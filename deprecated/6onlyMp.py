import cv2
import numpy as np
import mediapipe as mp
import argparse
import os
import glob
from tqdm import tqdm
from myutils import read_keypoints, DLT, get_projection_matrix, write_keypoints_to_disk, frameConcatenate,rDLT,dynamic_frame_concatenate


def multi_map_mp(streams,num_cams, bool_list, pureSkeletonVid_output_pth,mixVid_output_pth):
    print("=Running pose estimation...")
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose

    frame_shape = [1080, 1920]

    # Initialize video capture
    caps = []
    for idx in range(1, num_cams + 1):
        if bool_list[idx - 1] == 0:
            continue
        cap = cv2.VideoCapture(streams[idx - 1])
        fps = cap.get(cv2.CAP_PROP_FPS)
        print(f"=cam{idx} Input fps: {fps}")
        caps.append(cap)
    num_selected_cams = len(caps)
    print("=Number of Selected Camera: ", num_selected_cams)

    # Get the video information
    h = int(caps[0].get(cv2.CAP_PROP_FRAME_HEIGHT))
    w = int(caps[0].get(cv2.CAP_PROP_FRAME_WIDTH))
    size = (2 * w, 2 * h)

    # Output video stream with keypoints on it
    fourcc = cv2.VideoWriter_fourcc('m', 'p', '4', 'v')
    pureSkeleton_video_writer = cv2.VideoWriter(pureSkeletonVid_output_pth, fourcc, fps, size)
    mix_video_writer = cv2.VideoWriter(mixVid_output_pth, fourcc, fps, size)

    # Set camera resolution if using webcam
    for cap in caps:
        cap.set(3, frame_shape[1])
        cap.set(4, frame_shape[0])

    # Create body keypoints detector objects
    poses = [mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7) for _ in streams]

    kpts_cam = [[] for _ in streams]

    while True:
        ret = []
        frame = []
        results = []

        # Read frames from stream
        for cap in caps:
            current_ret, current_frame = cap.read()
            ret.append(current_ret)
            frame.append(current_frame)

        if not all(ret):
            break

        for idx, frm in enumerate(frame):
            # Convert the BGR image to RGB
            frame[idx] = cv2.cvtColor(frame[idx], cv2.COLOR_BGR2RGB)
            frame[idx].flags.writeable = False
            results.append(poses[idx].process(frame[idx]))
            frame[idx].flags.writeable = True
            frame[idx] = cv2.cvtColor(frame[idx], cv2.COLOR_RGB2BGR)

        # empty frame for skeleton-onlt visualization
        empty_frame = np.ones_like(frame[0]) * 0


        for idx, result in enumerate(results):
            current_cam_frame_keypoints = []
            if result.pose_landmarks:
                for i, landmark in enumerate(result.pose_landmarks.landmark):
                    pxl_x = int(round(landmark.x * frame[idx].shape[1]))
                    pxl_y = int(round(landmark.y * frame[idx].shape[0]))
                    kpts = [pxl_x, pxl_y]
                    current_cam_frame_keypoints.append(kpts)
            else:
                current_cam_frame_keypoints = [[-1, -1]] * 33

            kpts_cam[idx].append(current_cam_frame_keypoints)

            # for visualization
            mp_drawing.draw_landmarks(
                frame[idx],
                result.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2)
            )
            # for pure skeleton visualization
            mp_drawing.draw_landmarks(
                empty_frame,
                result.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2)
            )

        # Visualize
        ConcatFrame = dynamic_frame_concatenate(frame, h, w)
        ConcatFrame = cv2.resize(ConcatFrame, size, interpolation=cv2.INTER_AREA)
        empty_frame = cv2.resize(empty_frame, size, interpolation=cv2.INTER_AREA)

        mix_video_writer.write(ConcatFrame)
        pureSkeleton_video_writer.write(empty_frame)
        cv2.imshow('Pure Skeleton Frame', empty_frame)
        cv2.imshow('Concat Frame', ConcatFrame)

        k = cv2.waitKey(1)
        if k & 0xFF == 27:
            break  # 27 is ESC key.

    print("=Mix Video Saved:{} \n=Pure Skeleton Video Saved:{} ".format(mixVid_output_pth,pureSkeletonVid_output_pth)) 

    cv2.destroyAllWindows()
    mix_video_writer.release()
    pureSkeleton_video_writer.release()
    for cap in caps:
        cap.release()

def dynamic_frame_concatenate(frames, h, w):
    # Adjust this function to concatenate frames as per your requirement
    if len(frames) == 2:
        return np.hstack(frames)
    elif len(frames) == 3:
        top = np.hstack(frames[:2])
        bottom = frames[2]
        return np.vstack([top, bottom])
    elif len(frames) == 4:
        top = np.hstack(frames[:2])
        bottom = np.hstack(frames[2:])
        return np.vstack([top, bottom])
    return frames[0]

def SelectCam(num_cams):
    selected_cams = input("Enter camera index: ")
    if selected_cams == "":
        selected_cams = "1"
    selected_cams = selected_cams.split(',')
    bool_list = [0] * num_cams
    for i in selected_cams:
        bool_list[int(i) - 1] = 1
    print(bool_list)
    return bool_list

def main(args):
    print("=Running mediapipe pose estimation...")
    streams = []

    cam_parm_folder = "public/exp/{}".format(args["type"])
    motion_folder = cam_parm_folder

    video_files = sorted(glob.glob(f"{motion_folder}/cam*.mp4"))
    num_cams = len(video_files)
    print("=Number of all video: ", num_cams)

    for idx in range(1, num_cams + 1):
        print("=Loading video: ", "{}/cam{}.mp4".format(motion_folder, idx))
        streams.append(f"{motion_folder}/cam{idx}.mp4")
        intrinsic = "{}/cam{}.dat".format(cam_parm_folder, idx)
        extrinsic = "{}/rot_trans_cam{}.dat".format(cam_parm_folder, idx)


    print("=Please select 'the ONE' cameras you want to use: ")
    bool_list = SelectCam(num_cams)
    # go through bool_list and select only the cameras that are selected
    selected_cam_idx=999
    for idx,boolin in enumerate(bool_list):
        if boolin == 1:
            selected_cam_idx = idx+1
            break
    
    print("=Selected Camera Index: ", selected_cam_idx)

    
    pureSkeletonVid_output_pth = cam_parm_folder + "/{}_pureSkeleton_cam{}.mp4".format(args["type"],selected_cam_idx)
    mixVid_output_pth = cam_parm_folder + "/{}_mixSkeleton_cam{}.mp4".format(args["type"],selected_cam_idx)

    multi_map_mp(streams,num_cams ,bool_list, pureSkeletonVid_output_pth,mixVid_output_pth)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("-type", "--type", type=str, required=False, help="sports type", default="HCI")
    args = vars(ap.parse_args())
    main(args)
