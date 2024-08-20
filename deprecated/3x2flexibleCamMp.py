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
    bat_md= 0.75 
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
        cv2.imshow('Concat Frame', ConcatFrame)

        
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


def main(args):
    ''' this will load the sample videos if no camera ID is given '''
    print("=Running mediapipe pose estimation...")
    streams = []
    projections=[]

    ################################################################

    cam_parm_folder = "public/exp/{}".format(args["type"])
    motion_folder = cam_parm_folder
    vid_output_pth= cam_parm_folder + "/{}_skeleton{}.mp4".format(args["type"],args["num"])
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
                 ,"{}/kpts_3d_{}{}.bvh".format(
                     motion_folder, 
                     args["type"],
                     args["num"]),fps)
    # print("=bvh file saved: ", "{}/kpts_3d_{}.bvh".format(motion_folder, args["type"]))


if __name__ == "__main__":
    frame_by_frame = False
    #construct ap = argparse.ArgumentParser()
    ap = argparse.ArgumentParser()

    ap.add_argument("-type", "--type", type=str, required=False,
	                help="sports type",default="demo")
    ap.add_argument("-num", "---num", type=str, required=False,
	                help="player number#. This parameter is for different pose in same scene.",default="")

    args = vars(ap.parse_args())
    main(args)