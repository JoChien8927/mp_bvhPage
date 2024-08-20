import json
import cv2
from PIL import Image
from matplotlib.pylab import f
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
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
from myutils import read_keypoints, DLT, get_projection_matrix, write_keypoints_to_disk, frameConcatenate,rDLT,dynamic_frame_concatenate
from tqdm import tqdm 
# from bodypose3d import run_mp
import argparse

############################################################################################################

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

def plot_3d_skeleton(joints):
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    for connection in mp.solutions.pose.POSE_CONNECTIONS:
        start_idx, end_idx = connection
        if joints[start_idx][0] != -1 and joints[end_idx][0] != -1:
            x = [joints[start_idx][0], joints[end_idx][0]]
            y = [joints[start_idx][1], joints[end_idx][1]]
            z = [joints[start_idx][2], joints[end_idx][2]]
            ax.plot(x, y, z, marker='o')

    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    plt.show()

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

# project 3D point to 2D
def project_point(proj_matrix, point_3d):

    point_3d_h = np.append(point_3d, 1)  # homogeneous coordinates
    projected_2d = proj_matrix @ point_3d_h  
    if projected_2d[2] != 0:  # division by zero
        projected_2d /= projected_2d[2] # x/z, y/z, 1

    return int(projected_2d[0]), int(projected_2d[1])

def draw_axes(img, proj_matrix, origin_3d):
    """
    Draws the XYZ axes on the given image based on the projection matrix.

    Parameters:
    img (numpy array): The image on which to draw the axes.
    proj_matrix (numpy array): The projection matrix.
    origin_3d (tuple): The origin point (x, y, z) in 3D space.
    length (int): The length of the axes.
    """
    # Define the axis colors: X=red, Y=green, Z=blue
    colors = [(0, 0, 255), (0, 255, 0), (255, 0, 0)]

    # Define the axis directions: X, Y, Z
    directions_3d = [
        (1, 0, 0),  # X-axis
        (0, 1, 0),  # Y-axis
        (0, 0, 1)   # Z-axis
    ]

    origin_2d = project_point(proj_matrix, origin_3d)
    for color, direction_3d in zip(colors, directions_3d):
        # scale down the direction vector
        direction_3d = np.array(direction_3d) 
        end_point_3d = np.array(origin_3d) + np.array(direction_3d)
        end_point_2d = project_point(proj_matrix, end_point_3d)
        cv2.line(img, origin_2d, end_point_2d, color, 2)

def reproject_3d_to_2d(kpts_3d, projections, h, w):
    """
    Reprojects 3D keypoints to 2D using the given projection matrices.

    Parameters:
    kpts_3d (numpy array): 3D keypoints of shape (num_frames, num_keypoints, 3)
    projections (list): List of projection matrices for each camera
    h (int): Height of the image
    w (int): Width of the image

    Returns:
    numpy array: Reprojected 2D keypoints for each camera, shape (num_cameras, num_frames, num_keypoints, 2)
    """
    # print('image size (h,w):', (h, w))
    num_frames, num_keypoints, _ = kpts_3d.shape
    num_cameras = len(projections)
    
    kpts_2d = np.zeros((num_cameras, num_frames, num_keypoints, 2))
    
    for frame_idx in range(num_frames):
        for kp_idx in range(num_keypoints):
            point_3d = kpts_3d[frame_idx, kp_idx]  # 3D point
            for cam_idx, proj_matrix in enumerate(projections):
                x, y = project_point(proj_matrix, point_3d)
                
                # Optional: Correct the Y coordinate if necessary
                # y = h - y
                
                kpts_2d[cam_idx, frame_idx, kp_idx] = [x, y]

    return kpts_2d

def transform_to_right_handed(points):
    points_right_handed = points.copy()
    points_right_handed[:, 2] = -points_right_handed[:, 2]

    return points_right_handed

def preprocess_image(image):
    # 增強亮度和對比度
    image = cv2.convertScaleAbs(image, alpha=1, beta=10)
    return image

def crop_image(image,area='left_buttom'):
    height,width,channel =image.shape

    crop_width = width//4
    crop_height = height//2

    if area =='left_buttom':
        x1=0
        y1=height-crop_height
        x2=crop_width
        y2=height
    elif area =='right_buttom':
        x1 = width - crop_width
        y1 = height - crop_width
        x2 = width
        y2 = height
    else:
        print("Cropping area unfound!")
        return
    
    cropped_image= image[y1:y2,x1:x2]

    return cropped_image

############################################################################################################


def get_name_idx_map(landmark_names):
    name_idx_map = {}
    for idx in range(0, len(landmark_names)):
        name_idx_map[landmark_names[idx]] = idx
    return name_idx_map

def get_mixamo_names():
    return [
        ['mixamorig:Hips', 0, -1],  # left hip <->right hip
        ['mixamorig:Spine', 1, 0],
        ['mixamorig:Spine1', 2, 1],
        ['mixamorig:Spine2', 3, 2],

        ['mixamorig:Neck', 4, 3],  # left_shoulder <-> right_shoulder
        ['mixamorig:Head', 5, 4, "Nose"],  # left_ear <-> right_ear

        ['mixamorig:LeftArm', 6, 3, "LeftShoulder"],
        ['mixamorig:LeftForeArm', 7, 6, "LeftElbow"],
        ['mixamorig:LeftHand', 8, 7, "LeftWrist"],
        ['mixamorig:LeftHandThumb1', 9, 8, "LeftThumbEndSite"],
        ['mixamorig:LeftHandIndex1', 10, 8, "LeftIndexEndSite"],
        ['mixamorig:LeftHandPinky1', 11, 8, "LeftPinkyEndSite"],

        ['mixamorig:RightArm', 12, 3, "RightShoulder"],
        ['mixamorig:RightForeArm', 13, 12, "RightElbow"],
        ['mixamorig:RightHand', 14, 13, "RightWrist"],
        ['mixamorig:RightHandThumb1', 15, 14, "RightThumbEndSite"],
        ['mixamorig:RightHandIndex1', 16, 14, "RightIndexEndSite"],
        ['mixamorig:RightHandPinky1', 17, 14, "RightPinkyEndSite"],

        ['mixamorig:LeftUpLeg', 18, 0, "LeftHip"],
        ['mixamorig:LeftLeg', 19, 18, "LeftKnee"],
        ['mixamorig:LeftFoot', 20, 19, "LeftAnkle"],
        ['mixamorig:LeftToeBase', 21, 20, "LeftFootIndexEndSite"],

        ['mixamorig:RightUpLeg', 22, 0, "RightHip"],
        ['mixamorig:RightLeg', 23, 22, "RightKnee"],
        ['mixamorig:RightFoot', 24, 23, "RightAnkle"],
        ['mixamorig:RightToeBase', 25, 24, "RightFootIndexEndSite"]
    ]

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

# new bvh joints
new_joint_list = [
        'mixamorig:Hips',
        'mixamorig:Spine', 'mixamorig:Spine1', 'mixamorig:Spine2', 'mixamorig:Neck', 'mixamorig:Head',
        'mixamorig:LeftArm', 'mixamorig:LeftForeArm', 'mixamorig:LeftHand',
        'mixamorig:RightArm', 'mixamorig:RightForeArm', 'mixamorig:RightHand',
        'mixamorig:LeftUpLeg', 'mixamorig:LeftLeg', 'mixamorig:LeftFoot',
        'mixamorig:RightUpLeg', 'mixamorig:RightLeg', 'mixamorig:RightFoot'
    ]

#Mixamo joints


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
    # filter out the video streams for selected cameras
    selected_caps = []
    for idx in range(1, num_cams+1):
        if bool_list[idx-1] == 0:
            continue
        cap=cv2.VideoCapture(streams[idx-1])
        fps = cap.get(cv2.CAP_PROP_FPS)
        print(f"=cam{idx} Input fps: {fps}")
        selected_caps.append(cap)
    num_selected_cams=len(selected_caps)
    print("=Number of Selected Camera: ", num_selected_cams)
    
    # filter out the projections and keypoints for selected cameras
    selected_projections = [proj for idx, proj in enumerate(projections) if bool_list[idx]]
    # show shape of selected_projections
    print("num of selected_projections:",len(selected_projections))

    # get the video information
    _h = int(selected_caps[0].get(cv2.CAP_PROP_FRAME_HEIGHT))
    _w = int(selected_caps[0].get(cv2.CAP_PROP_FRAME_WIDTH))
    print("=Input video size (w,h): ", (_w, _h))


    # if num_selected_cams == 2:
    #     h,w = 540,1920
    # else:
    #     h,w = 1080,1920

    if num_selected_cams == 2:
        h,w = 270,960
    else:
        h,w = 540,960

    # size = (_w, _h)
    size = (w,h)
    print("=Output video size: ", size)
    
    # output video stream with keypoints on it
    fourcc = cv2.VideoWriter_fourcc('m', 'p', '4', 'v')
    videoWriter = cv2.VideoWriter(vid_output_pth, fourcc, fps, size)

    # set camera resolution if using webcam to 1280x720. Any bigger will cause some lag for hand detection
    for cap in selected_caps:
        cap.set(3, frame_shape[1])
        cap.set(4, frame_shape[0])

    # create body keypoints detector objects.
    bat_md= 0.7
    bat_mt= 0.85
    poses = [mp_pose.Pose(min_detection_confidence=bat_md, min_tracking_confidence=bat_md) for _ in streams]

    # pitch_md= 0.75
    # pitch_mt= 0.9
    # poses = [mp_pose.Pose(min_detection_confidence=pitch_md, min_tracking_confidence=pitch_mt) for _ in streams]

    
    # a list of "list of keypoints for each frame" in each camera
    kpts_cam = [[] for _ in streams]
    # a list for storing 3D keypoints from triangulation
    kpts_3d = []

    ret=[]
    frame=[]
    results=[]
    

    while True:
        ret = []
        frame = []
        results = []  # Initialize results list here

       

        # Read frames from stream
        for cap in selected_caps:
            current_ret, current_frame = cap.read()
            ret.append(current_ret)
            frame.append(current_frame)

        if not all(ret):
            break
        


        for idx, frm in enumerate(frame):
             # preprocess the image
            frame[idx] = preprocess_image(frame[idx])
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
                    mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2)
            )

        
        

        # flexible Triangulation
        frame_p3ds = []
        previous_frame_p3ds = None
        # for i in tqdm(range(33),desc="=Triangulating keypoints..."):  # For each keypoint
        for i in range(33):  # For each keypoint

            points = [kpts_cam[cam_idx][-1][i] for cam_idx in range(num_selected_cams)]
            valid_points = [(proj, pt) for proj, pt in zip(selected_projections, points) if pt[0] != -1]

            if len(valid_points) < 2:  # Need at least two points for triangulation
                # 用前一個frame的3D座標來補
                if previous_frame_p3ds is not None:
                    frame_p3ds.append(previous_frame_p3ds[i])
                else:
                    frame_p3ds.append([-1, -1, -1])
            else:
                used_projections, used_points = zip(*valid_points)
                _p3d = rDLT(used_projections, used_points)
                frame_p3ds.append(_p3d)
        previous_frame_p3ds = frame_p3ds
        frame_p3ds = np.array(frame_p3ds).reshape((33, 3))
        kpts_3d.append(frame_p3ds)


        # Reproject 3D keypoints to 2D for visualization
        rp_kpts_2d = reproject_3d_to_2d(np.array(kpts_3d), selected_projections,_h,_w)
        for cam_idx in range(num_selected_cams):
            frame_2d_kpts = rp_kpts_2d[cam_idx, -1]
            # Draw keypoints
            for kp_idx, (x, y) in enumerate(frame_2d_kpts):
                if x != -1 and y != -1:
                    cv2.circle(frame[cam_idx], (int(x), int(y)), 5, (0, 255, 0), -1)
            
            # Draw bones
            for connection in mp_pose.POSE_CONNECTIONS:
                start_idx, end_idx = connection
                if frame_2d_kpts[start_idx][0] != -1 and frame_2d_kpts[start_idx][1] != -1 and frame_2d_kpts[end_idx][0] != -1 and frame_2d_kpts[end_idx][1] != -1:
                    start_point = (int(frame_2d_kpts[start_idx][0]), int(frame_2d_kpts[start_idx][1]))
                    end_point = (int(frame_2d_kpts[end_idx][0]), int(frame_2d_kpts[end_idx][1]))
                    cv2.line(frame[cam_idx], start_point, end_point, (0, 255, 0), 2)

            # Draw XYZ axes on the frame
            origin_3d = (0, 0, 0)  # Change origin to the world coordinate origin
            draw_axes(frame[cam_idx], selected_projections[cam_idx], origin_3d)

        # Visualize
        
        ConcatFrame = dynamic_frame_concatenate(frame, size[1], size[0])
        ConcatFrame = cv2.resize(ConcatFrame, size, interpolation=cv2.INTER_AREA)
        
        #write the frame to video named "output.mp4"
        videoWriter.write(ConcatFrame)
        cv2.imshow('Concat Frame_'+args['stage']+"_"+args["type"], ConcatFrame)

        
        k = cv2.waitKey(1)
        # pause
        if k & 0xFF == ord('p') :
            cv2.waitKey(-1)
        
        if  frame_by_frame:
            cv2.waitKey(0)
        if k & 0xFF == 27 or k & 0xFF == ord('q'): break #27 is ESC key.
    
    print("=Video Saved: ", vid_output_pth)
    
    cv2.destroyAllWindows()
    videoWriter.release()
    # cv2.destroyAllWindows()
    for cap in selected_caps:
        cap.release()

        
    print("=Smoothing the motion data...")
    kpts_3d = np.array(kpts_3d)
    smooth_ws = 6
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

# def process_file(keypoints_input,outputfile,fps):
#     predictions = read_keypoints(keypoints_input)
#     predictions_copy = np.zeros((predictions.shape[0], 26, 3))

#     joint_by_frame = []
    
#     for frame in range(predictions_copy.shape[0]):
#         res = {}
#         for index, name in enumerate(landmark_names):
#             res[name] = predictions[frame][index]
#         res['MidHip'] = get_center(res['LeftHip'], res['RightHip'])
#         res['MidShoulder'] = get_center(res['LeftShoulder'], res['RightShoulder'])
#         res['Spine'] = get_spine(res['MidShoulder'], res['MidHip'])

#         for index, name in enumerate(joint_list):
#             # scale up the keypoints x50 to match the bvh scale
#             predictions_copy[frame][index][0] = res[name][2]*50
#             predictions_copy[frame][index][1] = res[name][1]*50
#             predictions_copy[frame][index][2] = res[name][0]*50
        
#     print("Generating bvh...")
#     print("FRAME NUM:",predictions_copy.shape[0])
#     write_mediapipe_bvh(outputfile, predictions_copy,fps)


def process_file(keypoints_input, outputfile, fps):
    # 讀取 JSON 文件中的 3D 關鍵點數據
    with open(keypoints_input, 'r') as infile:
        json_data = json.load(infile)
    
    # 獲取幀數信息
    frames_data = json_data["data"]
    num_frames = json_data["shape"]["num_frames"]
    num_keypoints = json_data["shape"]["num_keypoints"]

    # 初始化一個空的 numpy 數組來存放處理後的數據
    predictions_copy = np.zeros((num_frames, len(joint_list), 3))
    
    for frame_idx, frame_data in enumerate(frames_data):
        keypoints = {kp["name"]: np.array(kp["coordinates"]) for kp in frame_data["keypoints"]}
        
        res = {}
        for index, name in enumerate(landmark_names):
            res[name] = keypoints.get(name, np.array([0, 0, 0]))
        
        # 計算新關鍵點的位置
        res['MidHip'] = get_center(res['LeftHip'], res['RightHip'])
        res['MidShoulder'] = get_center(res['LeftShoulder'], res['RightShoulder'])
        res['Spine'] = get_spine(res['MidShoulder'], res['MidHip'])

        # 將結果存入 predictions_copy
        for index, name in enumerate(joint_list):
            # 放大關鍵點數據以匹配 BVH 的比例
            predictions_copy[frame_idx][index][0] = res[name][2] * 50
            predictions_copy[frame_idx][index][1] = res[name][1] * 50
            predictions_copy[frame_idx][index][2] = res[name][0] * 50
    
    print("Generating BVH...")
    print("FRAME NUM:", predictions_copy.shape[0])
    
    # 將處理後的數據寫入 BVH 文件
    write_mediapipe_bvh(outputfile, predictions_copy, fps)

    print("Generating BVH...")
    print("FRAME NUM:", predictions_copy.shape[0])
    
    # 將處理後的數據寫入 BVH 文件
    write_mediapipe_bvh(outputfile, predictions_copy, fps)


def write_mediapipe_bvh(outbvhfilepath, prediction3dpoint,fps):
    bvhfileName = outbvhfilepath
    skeleton = mediapipe_skeleton.MediapipeSkeleton()
    # print("mp skeleton", mediapipe_skeleton)
    skeleton.poses2bvh(prediction3dpoint, output_file=bvhfileName,fps=fps)
    print("=BVH file saved: ", bvhfileName)

def map_mediapipe_to_mixamo(bone_name, frame_keypoints, name_idx_map):
    """将 Mediapipe 的关节名称映射到 Mixamo 的对应名称"""
    position = {"x": 0.0, "y": 0.0, "z": 0.0}  # 默认值

    if bone_name == 'mixamorig:Hips':
        left_hip_idx = name_idx_map["LeftHip"]
        right_hip_idx = name_idx_map["RightHip"]
        position = {
            "x": (frame_keypoints[left_hip_idx][0] + frame_keypoints[right_hip_idx][0]) / 2 * 100,
            "y": (frame_keypoints[left_hip_idx][1] + frame_keypoints[right_hip_idx][1]) / 2 * 100,
            "z": (frame_keypoints[left_hip_idx][2] + frame_keypoints[right_hip_idx][2]) / 2 * 100
        }
    elif bone_name == 'mixamorig:Neck':
        left_shoulder_idx = name_idx_map["LeftShoulder"]
        right_shoulder_idx = name_idx_map["RightShoulder"]
        position = {
            "x": (frame_keypoints[left_shoulder_idx][0] + frame_keypoints[right_shoulder_idx][0]) / 2 * 100,
            "y": (frame_keypoints[left_shoulder_idx][1] + frame_keypoints[right_shoulder_idx][1]) / 2 * 100,
            "z": (frame_keypoints[left_shoulder_idx][2] + frame_keypoints[right_shoulder_idx][2]) / 2 * 100
        }
    elif bone_name == 'mixamorig:Spine1':
        hip_idx = 0
        neck_idx = 4
        position = {
            "x": (frame_keypoints[hip_idx][0] + frame_keypoints[neck_idx][0]) / 2 * 100,
            "y": (frame_keypoints[hip_idx][1] + frame_keypoints[neck_idx][1]) / 2 * 100,
            "z": (frame_keypoints[hip_idx][2] + frame_keypoints[neck_idx][2]) / 2 * 100
        }
    elif bone_name == 'mixamorig:Spine2':
        spine1_idx = 2
        neck_idx = 4
        position = {
            "x": (frame_keypoints[spine1_idx][0] + frame_keypoints[neck_idx][0]) / 2 * 100,
            "y": (frame_keypoints[spine1_idx][1] + frame_keypoints[neck_idx][1]) / 2 * 100,
            "z": (frame_keypoints[spine1_idx][2] + frame_keypoints[neck_idx][2]) / 2 * 100
        }
    elif bone_name == 'mixamorig:Spine':
        spine1_idx = 2
        hip_idx = 0
        position = {
            "x": (frame_keypoints[spine1_idx][0] + frame_keypoints[hip_idx][0]) / 2 * 100,
            "y": (frame_keypoints[spine1_idx][1] + frame_keypoints[hip_idx][1]) / 2 * 100,
            "z": (frame_keypoints[spine1_idx][2] + frame_keypoints[hip_idx][2]) / 2 * 100
        }
    else:
        mediapipe_name = bone_name.split(':')[-1] if ':' in bone_name else bone_name
        if mediapipe_name in name_idx_map:
            keypoint_idx = name_idx_map[mediapipe_name]
            position = {
                "x": frame_keypoints[keypoint_idx][0] * 100,
                "y": frame_keypoints[keypoint_idx][1] * 100,
                "z": frame_keypoints[keypoint_idx][2] * 100
            }

    return position

def convert_keypoints_to_mixamo_format(kpts_3d, animation_name="ConvertedAnimation"):
    """
    Convert 3D keypoints data to the Mixamo format JSON file structure.

    Parameters:
    kpts_3d (numpy array): 3D keypoints data of shape (num_frames, num_keypoints, 3)
    animation_name (str): The name for the animation file.

    Returns:
    dict: JSON structure in Mixamo format
    """
    anim_result_json = {
        "fileName": animation_name,
        "duration": 0,
        "ticksPerSecond": 30,  # Default ticks per second
        "frames": []
    }

    name_idx_map = get_name_idx_map(landmark_names)
    mixamo_names = get_mixamo_names()

    for frame_idx, frame_keypoints in enumerate(kpts_3d):
        bones_json = {
            "time": frame_idx / 30,  # Assuming 30 FPS as ticksPerSecond
            "bones": []
        }

        for bone in mixamo_names:
            bone_name = bone[0]
            position = map_mediapipe_to_mixamo(bone_name, frame_keypoints, name_idx_map)

            bones_json["bones"].append({
                "name": bone_name,
                "position": position,
                "rotation": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}
            })

        anim_result_json["frames"].append(bones_json)

    anim_result_json["duration"] = len(kpts_3d) / anim_result_json["ticksPerSecond"]

    return anim_result_json


def main(args):
    ''' this will load the sample videos if no camera ID is given '''
    print("=Running mediapipe pose estimation...")
    streams = []
    projections=[]

    ################################################################

    root_folder = "public/exp/Rapsodo/RapsodoSync/"
    motion_folder = root_folder+"{}".format(args["stage"])
    print("=Motion folder: ", motion_folder)
    vid_output_pth= motion_folder + "/{}_skeleton_{}.mp4".format(args["stage"],args["type"])
    ################################################################

    #get # of video 
    video_files = sorted(glob.glob(f"{motion_folder}/cam*.mp4"))
    num_cams = len(video_files)
    print("=Number of all cameras: ", num_cams)

    for idx in range(1, num_cams+1):
        print("=Loading video: ", "{}/cam{}.mp4".format(motion_folder,idx))
        streams.append(f"{motion_folder}/cam{idx}.mp4")
        intrinsic = "{}/cam_matrix/cam{}.dat".format(root_folder,idx)
        extrinsic = "{}/cam_matrix/rot_trans_cam{}.dat".format(root_folder, idx)

        ''' get projection matrices '''
        projections.append(get_projection_matrix(intrinsic, extrinsic))

    print("=Please select the cameras you want to use: ")
    bool_list = SelectCam(num_cams)
    

    # keypoints after multi-mediapipe & Triangulation
    kpts_3d = run_mp(streams, projections,num_cams,bool_list,vid_output_pth)
        

    # get the fps of the stream
    cap = cv2.VideoCapture(streams[0])
    fps = cap.get(cv2.CAP_PROP_FPS)
    # adjusted_fps fps to integer
    adjusted_fps = math.ceil(fps)
    print("=Adjusted fps: ", adjusted_fps)
    cap.release()

    
    ############################################################################

    # write the keypoints to disk (to dat)
    keypoint_path = motion_folder + '/kpts_3d_{}.dat'.format(args["stage"])
    write_keypoints_to_disk(keypoint_path,landmark_names ,kpts_3d)
    print('Reading keypoints ...')
    #write to json
    # keypoint_path = motion_folder + '/kpts_3d_{}.json'.format(args["stage"])
    # write_keypoints_to_disk(keypoint_path,landmark_names, kpts_3d)
    # print(f"JSON file has been saved to: {keypoint_path}")

    # writing bvh
    process_file(keypoint_path
                 ,"{}/kpts_3d_{}_{}.bvh".format(
                     motion_folder, 
                     args["stage"],
                     args["type"]),fps)
    print("=bvh file saved: ", "{}/kpts_3d_{}.bvh".format(motion_folder, args["stage"]))

    ############################################################################


    

    ############################################################################
    
    # 轉換 3D 關鍵點數據為 Mixamo 格式的 JSON
    animation_name = "{}_skeleton_{}".format(args["stage"],args["type"])
    anim_json = convert_keypoints_to_mixamo_format(kpts_3d, animation_name)

    mixamo_keypoint_path = motion_folder + '/mixamo_kpts_3d_{}.json'.format(args["stage"])
    
    ############################################################################
    #write
    with open(mixamo_keypoint_path, "w") as f:
        json.dump(anim_json, f,indent=2)



    
    

if __name__ == "__main__":

    frame_by_frame = False
    #construct ap = argparse.ArgumentParser()
    ap = argparse.ArgumentParser()

    ap.add_argument("-stage", "--stage", type=str, required=False,
	                help="sports stage",default="demo")
    ap.add_argument("-type", "---type", type=str, required=False,
	                help="player type ex.bat/pitch. This parameter is for different pose in same scene.",default="bat")

    args = vars(ap.parse_args())
    main(args)


