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
from utils import read_keypoints, DLT, get_projection_matrix, write_keypoints_to_disk, frameConcatenate
# from bodypose3d import run_mp
import argparse

# inputFile = sys.argv[1]  # outputs/inputvideo/batting.mp4
# fileLocation = sys.argv[0] # "C:/Users/calvi/OneDrive/Documents/github/mocap-data/" + calibration_id + / +recording_id+_idx
# outputFile = sys.argv[0]  # coach_pitching.bvh

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

joint_list = [
    'MidHip',
    'RightHip', 'RightKnee', 'RightAnkle', 'RightHeelEndSite', 'RightFootIndexEndSite',
    'LeftHip', 'LeftKnee', 'LeftAnkle', 'LeftHeelEndSite', 'LeftFootIndexEndSite',
    'Spine', 'Nose',
    'MidShoulder',
    'LeftShoulder', 'LeftElbow', 'LeftWrist', 'LeftPinkyEndSite', 'LeftIndexEndSite', 'LeftThumbEndSite',
    'RightShoulder', 'RightElbow', 'RightWrist', 'RightPinkyEndSite', 'RightIndexEndSite', 'RightThumbEndSite'
]

def run_mp(input_stream1, input_stream2, input_stream3, input_stream4, P0, P1, P2, P3):

    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles
    mp_pose = mp.solutions.pose

    frame_shape = [1080, 1920]

    # add here if more keypoints are needed
    pose_keypoints = [16, 14, 12, 11, 13, 15, 24, 23, 25, 26, 27, 28]
    
    # input video stream
    cap0 = cv2.VideoCapture(input_stream1)
    cap1 = cv2.VideoCapture(input_stream2)
    cap2 = cv2.VideoCapture(input_stream3)
    cap3 = cv2.VideoCapture(input_stream4)
    
    caps = [cap0, cap1, cap2, cap3]
    
    # get the video information
    fps = cap0.get(cv2.CAP_PROP_FPS)
    print("=Vids Input fps: ", fps)
    h = int(cap0.get(cv2.CAP_PROP_FRAME_HEIGHT))
    w = int(cap0.get(cv2.CAP_PROP_FRAME_WIDTH))
    size = (2*w, 2*h)
    
    # output
    # out = "media/bullpen/output/pitch3_1_3.mp4"
    # fourcc = cv2.VideoWriter_fourcc('m', 'p', '4', 'v')
    # videoWriter = cv2.VideoWriter(out, fourcc, 60, size)

    # set camera resolution if using webcam to 1280x720. Any bigger will cause some lag for hand detection
    for cap in caps:
        cap.set(3, frame_shape[1])
        cap.set(4, frame_shape[0])

    # create body keypoints detector objects.
    pose0 = mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7)
    pose1 = mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7)
    pose2 = mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7)
    pose3 = mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7)

    # containers for detected keypoints for each camera. These are filled at each frame.
    # This will run you into memory issue if you run the program without stop
    kpts_cam0 = []
    kpts_cam1 = []
    kpts_cam2 = []
    kpts_cam3 = []
    kpts_3d = []
    
    while True:

        #read frames from stream
        ret0, frame0 = cap0.read()
        ret1, frame1 = cap1.read()
        ret2, frame2 = cap2.read()
        ret3, frame3 = cap3.read()

        if not ret0 or not ret1 or not ret2 or not ret3: break


        # the BGR image to RGB.
        frame0 = cv2.cvtColor(frame0, cv2.COLOR_BGR2RGB)
        frame1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2RGB)
        frame2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2RGB)
        frame3 = cv2.cvtColor(frame3, cv2.COLOR_BGR2RGB)

        # To improve performance, optionally mark the image as not writeable to
        # pass by reference.
        frame0.flags.writeable = False
        frame1.flags.writeable = False
        frame2.flags.writeable = False
        frame3.flags.writeable = False
        results0 = pose0.process(frame0)
        results1 = pose1.process(frame1)
        results2 = pose2.process(frame2)
        results3 = pose3.process(frame3)

        #reverse changes
        frame0.flags.writeable = True
        frame1.flags.writeable = True
        frame2.flags.writeable = True
        frame3.flags.writeable = True
        frame0 = cv2.cvtColor(frame0, cv2.COLOR_RGB2BGR)
        frame1 = cv2.cvtColor(frame1, cv2.COLOR_RGB2BGR)
        frame2 = cv2.cvtColor(frame2, cv2.COLOR_RGB2BGR)
        frame3 = cv2.cvtColor(frame3, cv2.COLOR_RGB2BGR)

        ''' FIRST CAMERA '''
        #check for keypoints detection
        
        frame0_keypoints = []
        if results0.pose_landmarks:
            for i, landmark in enumerate(results0.pose_landmarks.landmark):
                ''' MARK '''
                # if i not in pose_keypoints: continue #only save keypoints that are indicated in pose_keypoints
                pxl_x = landmark.x * frame0.shape[1]
                pxl_y = landmark.y * frame0.shape[0]
                pxl_x = int(round(pxl_x))
                pxl_y = int(round(pxl_y))
                # cv.circle(frame0,(pxl_x, pxl_y), 3, (0,0,255), -1) #add keypoint detection points into figure
                kpts = [pxl_x, pxl_y]
                frame0_keypoints.append(kpts)
        else:
            #if no keypoints are found, simply fill the frame data with [-1,-1] for each kpt
            ''' MARK '''
            # frame0_keypoints = [[-1, -1]]*len(pose_keypoints)
            frame0_keypoints = [[-1, -1]]*33

        #this will keep keypoints of this frame in memory
        kpts_cam0.append(frame0_keypoints)
        
        # Render detections
        mp_drawing.draw_landmarks(frame0, results0.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                mp_drawing.DrawingSpec(color=(0,0,255), thickness=2, circle_radius=2), 
                                mp_drawing.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=2) 
                                ) 

        ''' SECOND CAMERA '''
        frame1_keypoints = []
        if results1.pose_landmarks:
            for i, landmark in enumerate(results1.pose_landmarks.landmark):
                # if i not in pose_keypoints: continue
                pxl_x = landmark.x * frame1.shape[1]
                pxl_y = landmark.y * frame1.shape[0]
                pxl_x = int(round(pxl_x))
                pxl_y = int(round(pxl_y))
                # cv.circle(frame1,(pxl_x, pxl_y), 3, (0,0,255), -1)
                kpts = [pxl_x, pxl_y]
                frame1_keypoints.append(kpts)

        else:
            #if no keypoints are found, simply fill the frame data with [-1,-1] for each kpt
            # frame1_keypoints = [[-1, -1]]*len(pose_keypoints)
            frame1_keypoints = [[-1, -1]]*33

        #update keypoints container
        kpts_cam1.append(frame1_keypoints)
        
        # Render detections
        mp_drawing.draw_landmarks(frame1, results1.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                mp_drawing.DrawingSpec(color=(0,0,255), thickness=2, circle_radius=2), 
                                mp_drawing.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=2) 
                                ) 
        
        ''' THIRD CAMERA'''
        frame2_keypoints = []
        if results2.pose_landmarks:
            for i, landmark in enumerate(results2.pose_landmarks.landmark):
                # if i not in pose_keypoints: continue
                pxl_x = landmark.x * frame2.shape[1]
                pxl_y = landmark.y * frame2.shape[0]
                pxl_x = int(round(pxl_x))
                pxl_y = int(round(pxl_y))
                # cv.circle(frame2,(pxl_x, pxl_y), 3, (0,0,255), -1)
                kpts = [pxl_x, pxl_y]
                frame2_keypoints.append(kpts)

        else:
            #if no keypoints are found, simply fill the frame data with [-1,-1] for each kpt
            # frame2_keypoints = [[-1, -1]]*len(pose_keypoints)
            frame2_keypoints = [[-1, -1]]*33

        # #update keypoints container
        kpts_cam2.append(frame2_keypoints)
        
        # Render detections
        mp_drawing.draw_landmarks(frame2, results2.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                mp_drawing.DrawingSpec(color=(0,0,255), thickness=2, circle_radius=2), 
                                mp_drawing.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=2) 
                                )
        
        ''' FOURTH CAMERA'''
        frame3_keypoints = []
        if results3.pose_landmarks:
            for i, landmark in enumerate(results3.pose_landmarks.landmark):
                # if i not in pose_keypoints: continue
                pxl_x = landmark.x * frame3.shape[1]
                pxl_y = landmark.y * frame3.shape[0]
                pxl_x = int(round(pxl_x))
                pxl_y = int(round(pxl_y))
                # cv2.circle(frame3,(pxl_x, pxl_y), 3, (0,0,255), -1)
                kpts = [pxl_x, pxl_y]
                frame3_keypoints.append(kpts)

        else:
            #if no keypoints are found, simply fill the frame data with [-1,-1] for each kpt
            # frame3_keypoints = [[-1, -1]]*len(pose_keypoints)
            frame3_keypoints = [[-1, -1]]*33

        # #update keypoints container
        kpts_cam3.append(frame3_keypoints)
        
        # Render detections
        mp_drawing.draw_landmarks(frame3, results3.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                mp_drawing.DrawingSpec(color=(0,0,255), thickness=2, circle_radius=2), 
                                mp_drawing.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=2) 
                                )

        
        ''' Triangulation '''
        frame_p3ds = []
        for uv1, uv2, uv3, uv4 in zip(frame0_keypoints, frame1_keypoints, frame2_keypoints, frame3_keypoints):
            if uv1[0] == -1 or uv2[0] == -1 or uv3[0] == -1 or uv4[0] == -1:
                _p3d = [-1, -1, -1]
            else:
                _p3d = DLT(P0, P1, P2, P3, uv1, uv2, uv3, uv4) #calculate 3d position of keypoint
            frame_p3ds.append(_p3d)
           
        
        
        ''' Change shape to 33 '''
        frame_p3ds = np.array(frame_p3ds).reshape((33, 3))
        kpts_3d.append(frame_p3ds)

        
        # Visualize
        size = (2*w, 2*h)
        ConcatFrame = frameConcatenate(frame0, frame1, frame2, frame3, h, w)
        ConcatFrame = cv2.resize(ConcatFrame, size, interpolation=cv2.INTER_AREA)
        # re-scale the ConcatFrame to 1080x1920
        ConcatFrame = cv2.resize(ConcatFrame, (1920, 1080), interpolation=cv2.INTER_AREA)
        cv2.imshow('Concat Frame', ConcatFrame)
        # videoWriter.write(ConcatFrame)

        k = cv2.waitKey(1)
        if k & 0xFF == 27: break #27 is ESC key.


    cv2.destroyAllWindows()
    # videoWriter.release()
    for cap in caps:
        cap.release()
    
    # to smooth the motion data
    print("=Smoothing the motion data...")
    kpts_3d = np.array(kpts_3d)
    ws = 7
    print("smooth with window size" , ws, " in moving average")
    # Apply smoothing to the 3D keypoints
    kpts_3d_smoothed = moving_average_smoothing(kpts_3d, window_size=ws)

    # show last keypoints in 3d 
    # print("mp last 3d keypoints: ", kpts_3d[-1])
    return np.array(kpts_cam0), np.array(kpts_cam1), np.array(kpts_cam2), np.array(kpts_cam3), kpts_3d_smoothed

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

def main(args):
    ''' this will load the sample videos if no camera ID is given '''
    print("=Running mediapipe pose estimation...")
    streams = []
    projections=[]
    cam_parm_folder = "public/exp/{}".format(args["type"])
    motion_folder = "public/exp/{}".format(args["type"])
    for idx in [1,2,3,4]:
        # streams.append("public/motion/{}/cam{}.mp4".format(args["type"],idx))
        streams.append(f"{motion_folder}/cam{idx}.mp4")
        intrinsic = "{}/cam{}.dat".format(cam_parm_folder,idx)
        extrinsic = "{}/rot_trans_cam{}.dat".format(cam_parm_folder, idx)
        ''' get projection matrices '''
        projections.append(get_projection_matrix(intrinsic, extrinsic))

    
    # input_stream1 = 'media/boxing/cam1_9_back_10.mp4'
    # input_stream2 = 'media/boxing/cam2_9_back_10.mp4'
    # input_stream3 = 'media/boxing/cam3_9_back_10.mp4'
    # input_stream4 = 'media/boxing/cam4_9_back_10.mp4'

    
    kpts_cam0, kpts_cam1, kpts_cam2, kpts_cam3, kpts_3d = run_mp(streams[0], streams[1], streams[2], streams[3], projections[0], projections[1], projections[2], projections[3])
    # kpts_cam0, kpts_cam1, kpts_cam2, kpts_cam3, kpts_3d = run_mp(input_stream1, input_stream2, input_stream3, input_stream4, projections[0], projections[1], projections[2], projections[3])
    
    cap = cv2.VideoCapture(streams[0])
    fps = cap.get(cv2.CAP_PROP_FPS)
    # 無條件進位
    adjusted_fps = math.ceil(fps)
    # adjusted_fps = 60
    print("=Adjusted fps: ", adjusted_fps)
    cap.release()

    #this will create keypoints file in current working folder
    # write_keypoints_to_disk('kpts_cam0.dat', kpts_cam0)
    # write_keypoints_to_disk('kpts_cam1.dat', kpts_cam1)
    keypoint_file='kpts_3d_{}.dat'.format(args["type"])
    write_keypoints_to_disk(keypoint_file, kpts_3d)
    print('Reading keypoints ...')
    process_file(keypoint_file
                 ,"{}/kpts_3d_{}.bvh".format(motion_folder, args["type"])
                 ,fps)

if __name__ == "__main__":
    #construct ap = argparse.ArgumentParser()
    ap = argparse.ArgumentParser()
    # ap.add_argument("-path", "--path", type=str, required=False,
	#                 help="path to video files",default="./media/boxing" )
    ap.add_argument("-type", "--type", type=str, required=False,
	                help="sports type",default="pitching")
    # ap.add_argument("-cal", "--calibration_id", type=str, required=True,
	#                 help="path to ")
    # ap.add_argument("-rec", "--recording_id", type=str, required=True,
	#                 help="path to ")
    args = vars(ap.parse_args())
    main(args)