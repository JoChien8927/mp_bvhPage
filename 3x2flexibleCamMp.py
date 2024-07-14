import cv2
from PIL import Image
from matplotlib.pylab import f
import matplotlib.pyplot as plt
import numpy as np
import mediapipe as mp
from bvh_skeleton import mediapipe_skeleton
import sys
import os
import glob
import subprocess
from pathlib import Path
from multiprocessing.pool import ThreadPool
import math
from collections import deque
from utils import read_keypoints, DLT, get_projection_matrix, write_keypoints_to_disk, frameConcatenate,rDLT,dynamic_frame_concatenate
from tqdm import tqdm 
# from bodypose3d import run_mp
import argparse

# inputFile = sys.argv[1]  # outputs/inputvideo/batting.mp4
# fileLocation = sys.argv[0] # "C:/Users/calvi/OneDrive/Documents/github/mocap-data/" + calibration_id + / +recording_id+_idx
# outputFile = sys.argv[0]  # coach_pitching.bvh

# mediapipe joints
landmark_names = [
    'Nose',

    'LeftEyeInner', 'LeftEye', 'LeftEyeOuter',

    'RightEyeInner', 'RightEye', 'RightEyeOuter',

    'LeftEarEndSite', 'RightEarEndSite',
    'LeftMouth', 'RightMouth',
    'LeftShoulder', "RightShoulder",
    "LeftElbow", "RightElbow",
    "LeftWrist", "RightWrist",
    "LeftPinkyEndSite", "RightPinkyEndSite",
    "LeftIndexEndSite", "RightIndexEndSite",
    "LeftThumbEndSite", "RightThumbEndSite",
    "LeftHip", "RightHip",
    "LeftKnee", "RightKnee",
    "LeftAnkle", "RightAnkle",
    "LeftHeelEndSite", "RightHeelEndSite",
    "LeftFootIndexEndSite", "RightFootIndexEndSite"
]

# bvh joints
joint_list = [
    'MidHip',
    'RightHip', 'RightKnee', 'RightAnkle', 'RightHeelEndSite', 'RightFootIndexEndSite',
    'LeftHip', 'LeftKnee', 'LeftAnkle', 'LeftHeelEndSite', 'LeftFootIndexEndSite',
    'Spine', 'Nose',
    'MidShoulder',
    'LeftShoulder', 'LeftElbow', 'LeftWrist', 'LeftPinkyEndSite', 'LeftIndexEndSite', 'LeftThumbEndSite',
    'RightShoulder', 'RightElbow', 'RightWrist', 'RightPinkyEndSite', 'RightIndexEndSite', 'RightThumbEndSite'
]


def run_mp(streams, projections,num_cams,bool_list,vid_output_pth):

    print("=Running pose estimation...")
    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles
    mp_pose = mp.solutions.pose

    frame_shape = [1080, 1920]

    # add here if more keypoints are needed
    pose_keypoints = [16, 14, 12, 11, 13, 15, 24, 23, 25, 26, 27, 28]
    
    # input video stream
    #dynamic camera input
    caps = []

    
    for idx in range(1, num_cams+1):
        if bool_list[idx-1] == 0:
            continue
        cap=cv2.VideoCapture(streams[idx-1])
        fps = cap.get(cv2.CAP_PROP_FPS)
        print(f"=cam{idx} Input fps: {fps}")
        caps.append(cap)
    num_selected_cams=len(caps)
    print("=Number of Selected Camera: ", num_selected_cams)
    
    # get the video information
    h = int(caps[0].get(cv2.CAP_PROP_FRAME_HEIGHT))
    w = int(caps[0].get(cv2.CAP_PROP_FRAME_WIDTH))


    if num_selected_cams == 2:
        h,w = 270,960
    else:
        h,w = 540,960
    size = (2*w, 2*h)
    print("=Output video size: ", size)
    
    # output video stream with keypoints on it
    fourcc = cv2.VideoWriter_fourcc('m', 'p', '4', 'v')
    videoWriter = cv2.VideoWriter(vid_output_pth, fourcc, fps, size)

    # set camera resolution if using webcam to 1280x720. Any bigger will cause some lag for hand detection
    for cap in caps:
        cap.set(3, frame_shape[1])
        cap.set(4, frame_shape[0])

    # create body keypoints detector objects.
    poses = [mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7) for _ in streams]

    # containers for detected keypoints for each camera. These are filled at each frame.
    # This will run you into memory issue if you run the program without stop
    

    kpts_3d = []
    # kpts_cam = []
    kpts_cam = [[] for _ in streams]
    #
    ret=[]
    frame=[]
    results=[]

    while True:
        ret = []
        frame = []
        results = []  # Initialize results list here

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
            results.append(poses[idx].process(frame[idx]))  # Process frame
            frame[idx].flags.writeable = True
            frame[idx] = cv2.cvtColor(frame[idx], cv2.COLOR_RGB2BGR)

        # Process keypoints for each camera
        # print("=Detecting keypoints through every camera...")
        for idx, result in enumerate(results):
            # print(f"=Detecting keypoints through camera {idx}...")
            currentCam_frame_keypoints = []
            if result.pose_landmarks:
                for i, landmark in enumerate(result.pose_landmarks.landmark):
                    pxl_x = int(round(landmark.x * frame[idx].shape[1]))
                    pxl_y = int(round(landmark.y * frame[idx].shape[0]))
                    kpts = [pxl_x, pxl_y]
                    currentCam_frame_keypoints.append(kpts)
            else:
                currentCam_frame_keypoints = [[-1, -1]] * 33

            kpts_cam[idx].append(currentCam_frame_keypoints)

            # Draw the 2d pose landmarks on the frame
            mp_drawing.draw_landmarks(
                frame[idx],
                result.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                    mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2)
            )
        
        # Triangulation
        frame_p3ds = []
        for i in tqdm(range(33),desc="=Triangulating keypoints..."):  # For each keypoint
            points = [kpts_cam[cam_idx][-1][i] for cam_idx in range(num_selected_cams)]
            valid_points = [(proj, pt) for proj, pt in zip(projections, points) if pt[0] != -1]

            if len(valid_points) < 2:  # Need at least two points for triangulation
                frame_p3ds.append([-1, -1, -1])
            else:
                used_projections, used_points = zip(*valid_points)
                # _p3d = DLT(*used_projections, *used_points)
                # print(f"Calling rDLT with {len(used_projections)} projections and {len(used_points)} points.")
                _p3d = rDLT(used_projections, used_points)
                frame_p3ds.append(_p3d)

        

        frame_p3ds = np.array(frame_p3ds).reshape((33, 3))
        kpts_3d.append(frame_p3ds)
        

        # Visualize
        size = (2*w, 2*h)
        ConcatFrame = dynamic_frame_concatenate(frame, h, w)
        ConcatFrame = cv2.resize(ConcatFrame, size, interpolation=cv2.INTER_AREA)
        # re-scale the ConcatFrame to 1080x1920
        #resize depends on number of cameras
        
        ConcatFrame = cv2.resize(ConcatFrame, size, interpolation=cv2.INTER_AREA)
        #write the frame to video named "output.mp4"
        videoWriter.write(ConcatFrame)
        cv2.imshow('Concat Frame', ConcatFrame)


        k = cv2.waitKey(1)
        if k & 0xFF == 27: break #27 is ESC key.
    
    print("=Video Saved: ", vid_output_pth)
    
    cv2.destroyAllWindows()
    videoWriter.release()
    # cv2.destroyAllWindows()
    for cap in caps:
        cap.release()

        
    print("=Smoothing the motion data...")
    kpts_3d = np.array(kpts_3d)
    smooth_ws = 7
    print("Smooth with window size", smooth_ws, "in moving average")
    kpts_3d_smoothed = moving_average_smoothing(kpts_3d, window_size=smooth_ws)

    return kpts_3d_smoothed

def get_center(a, b):
    """Calculates pose center as point between hips."""
    left = np.array(a)
    right = np.array(b)
    center = (left + right) * 0.5
    return center


def get_spine(a, b):
    mid_shoulder = np.array(a)
    mid_hip = np.array(b)
    center = (mid_shoulder - mid_hip) * 0.5 + mid_hip
    return center


def write_mediapipe_bvh(outbvhfilepath, prediction3dpoint,fps):
    bvhfileName = outbvhfilepath
    skeleton = mediapipe_skeleton.MediapipeSkeleton()
    # print("mp skeleton", mediapipe_skeleton)
    skeleton.poses2bvh(prediction3dpoint, output_file=bvhfileName,fps=fps)
    print("=BVH file saved: ", bvhfileName)


def SelectCam(num_cams):
    #if there are total 8 cameras, and we want to select 4 cameras, 
    # then the bool_list will be [1,0,1,0,1,0,1,0]
    selected_cams = input("Enter camera indices (comma-separated, e.g., 1,3,6): ")
    #if null, then select 1~4 cameras
    if selected_cams == "":
        selected_cams = "1,2"
    selected_cams = selected_cams.split(',')
    # print(selected_cams)
    #generate a list of booleans
    bool_list = [0]*num_cams
    for i in selected_cams:
        bool_list[int(i)-1] = 1
    print(bool_list)
    return bool_list



def process_file(keypoints_input,outputfile,fps):
    predictions = read_keypoints(keypoints_input)
    predictions_copy = np.zeros((predictions.shape[0], 26, 3))

    joint_by_frame = []
    
    for frame in range(predictions_copy.shape[0]):
        res = {}
        for index, name in enumerate(landmark_names):
            res[name] = predictions[frame][index]
        res['MidHip'] = get_center(res['LeftHip'], res['RightHip'])
        res['MidShoulder'] = get_center(res['LeftShoulder'], res['RightShoulder'])
        res['Spine'] = get_spine(res['MidShoulder'], res['MidHip'])

        for index, name in enumerate(joint_list):
            # scale up the keypoints x50 to match the bvh scale
            predictions_copy[frame][index][0] = res[name][2]*50
            predictions_copy[frame][index][1] = res[name][1]*50
            predictions_copy[frame][index][2] = res[name][0]*50
        
    print("Generating bvh...")
    print("FRAME NUM:",predictions_copy.shape[0])
    write_mediapipe_bvh(outputfile, predictions_copy,fps)

# smooth the motion data
def moving_average_smoothing(data, window_size=5):
    """
    Apply moving average smoothing to the input data.

    Parameters:
    data (numpy array): Input data of shape (num_frames, num_keypoints, 3)
    window_size (int): The size of the moving window for averaging

    Returns:
    numpy array: Smoothed data
    """
    smoothed_data = np.copy(data)
    num_frames, num_keypoints, _ = data.shape
    
    for i in range(num_keypoints):
        for j in range(3):  # x, y, z coordinates
            smoothed_data[:, i, j] = np.convolve(data[:, i, j], np.ones(window_size)/window_size, mode='same')
    
    return smoothed_data

def reproject_3d_to_2d(kpts_3d, projections):
    """
    Reprojects 3D keypoints to 2D using the given projection matrices.

    Parameters:
    kpts_3d (numpy array): 3D keypoints of shape (num_frames, num_keypoints, 3)
    projections (list): List of projection matrices for each camera

    Returns:
    list: Reprojected 2D keypoints for each camera, shape (num_cameras, num_frames, num_keypoints, 2)
    """
    num_frames, num_keypoints, _ = kpts_3d.shape
    num_cameras = len(projections)
    
    kpts_2d = [[[] for _ in range(num_keypoints)] for _ in range(num_cameras)]
    
    for frame_idx in range(num_frames):
        for kp_idx in range(num_keypoints):
            point_3d = np.append(kpts_3d[frame_idx, kp_idx], 1)  # Convert to homogeneous coordinates
            for cam_idx, proj_matrix in enumerate(projections):
                projected_2d = proj_matrix @ point_3d  # Matrix multiplication
                if projected_2d[2] != 0:  # Avoid division by zero
                    projected_2d /= projected_2d[2]
                kpts_2d[cam_idx][frame_idx].append(projected_2d[:2])
    
    return kpts_2d

def main(args):
    ''' this will load the sample videos if no camera ID is given '''
    print("=Running mediapipe pose estimation...")
    streams = []
    projections=[]

    ################################################################

    cam_parm_folder = "public/exp/{}".format(args["type"])
    motion_folder = cam_parm_folder
    vid_output_pth= cam_parm_folder + "/{}_skeleton.mp4".format(args["type"])
    ################################################################

    #get # of video 
    video_files = sorted(glob.glob(f"{motion_folder}/cam*.mp4"))
    num_cams = len(video_files)
    print("=Number of all cameras: ", num_cams)

    for idx in range(1, num_cams+1):
        print("=Loading video: ", "{}/cam{}.mp4".format(motion_folder,idx))
        streams.append(f"{motion_folder}/cam{idx}.mp4")
        intrinsic = "{}/cam{}.dat".format(cam_parm_folder,idx)
        extrinsic = "{}/rot_trans_cam{}.dat".format(cam_parm_folder, idx)

        ''' get projection matrices '''
        projections.append(get_projection_matrix(intrinsic, extrinsic))

    print("=Please select the cameras you want to use: ")
    bool_list = SelectCam(num_cams)
    

    kpts_3d = run_mp(streams, projections,num_cams,bool_list,vid_output_pth)
    # kpts_cam0, kpts_cam1, kpts_cam2, kpts_cam3, kpts_3d = run_mp(input_stream1, input_stream2, input_stream3, input_stream4, projections[0], projections[1], projections[2], projections[3])
    
    # get the fps of the stream
    cap = cv2.VideoCapture(streams[0])
    fps = cap.get(cv2.CAP_PROP_FPS)
    # adjusted_fps fps to integer
    adjusted_fps = math.ceil(fps)
    print("=Adjusted fps: ", adjusted_fps)
    cap.release()

    #this will create keypoints file in current working folder
    keypoint_file = motion_folder + '/kpts_3d_{}.dat'.format(args["type"])
    write_keypoints_to_disk(keypoint_file, kpts_3d)
    print('Reading keypoints ...')
    process_file(keypoint_file
                 ,"{}/kpts_3d_{}.bvh".format(motion_folder, args["type"])
                 ,fps)
    # print("=bvh file saved: ", "{}/kpts_3d_{}.bvh".format(motion_folder, args["type"]))

if __name__ == "__main__":
    #construct ap = argparse.ArgumentParser()
    ap = argparse.ArgumentParser()

    ap.add_argument("-type", "--type", type=str, required=False,
	                help="sports type",default="pj")

    args = vars(ap.parse_args())
    main(args)