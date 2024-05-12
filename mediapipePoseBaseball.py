import cv2
from PIL import Image
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
from bodypose3d import run_mp
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


def write_mediapipe_bvh(outbvhfilepath, prediction3dpoint):
    bvhfileName = outbvhfilepath
    skeleton = mediapipe_skeleton.MediapipeSkeleton()
    skeleton.poses2bvh(prediction3dpoint, output_file=bvhfileName)




def process_file(outputfile):
    predictions = read_keypoints('kpts_3d_pitch3_all.dat')
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
            predictions_copy[frame][index][0] = res[name][2]*50
            predictions_copy[frame][index][1] = res[name][1]*50
            predictions_copy[frame][index][2] = res[name][0]*50
        
    print("Generating bvh")
    write_mediapipe_bvh(outputfile, predictions_copy)

def main(args):
    ''' this will load the sample videos if no camera ID is given '''
    streams = []
    projections=[]
    intrinsic_matrix_file = "C://Users/calvi/OneDrive/Documents/github/mocap-data/intrinsic"
    fileLocation = args["path"]
    for idx in [1,2,3,4]:
        streams.append("{}/{}/{}_{}_new.mp4".format(fileLocation, args["calibration_id"], args["recording_id"], idx))
        intrinsic = "{}/camera{}.dat".format(intrinsic_matrix_file,0)
        extrinsic = "{}/{}/rot_trans_camera{}.dat".format(fileLocation, args["calibration_id"], idx-1)
        projections.append(get_projection_matrix(intrinsic, extrinsic))
    
    # input_stream1 = 'media/bullpen/pitch3/2-3-crop.mp4'
    # input_stream2 = 'media/bullpen/pitch3/3-3-crop.mp4'
    # input_stream3 = 'media/bullpen/pitch3/4-3-crop.mp4'
    # input_stream4 = 'media/bullpen/pitch3/5-3-crop.mp4'

    # input_stream1 = "C://Users/calvi/OneDrive/Documents/github/mocap-data/{}.mp4".format("6507c07d321da79201a7403a_1")
    # input_stream2 = "C://Users/calvi/OneDrive/Documents/github/mocap-data/{}.mp4".format("6507c07d321da79201a7403a_2")
    # input_stream3 = "C://Users/calvi/OneDrive/Documents/github/mocap-data/{}.mp4".format("6507c07d321da79201a7403a_3")
    # input_stream4 = "C://Users/calvi/OneDrive/Documents/github/mocap-data/{}.mp4".format("6507c07d321da79201a7403a_4")
    

    # ''' get projection matrices '''
    # P2 = get_projection_matrix(0)
    # P3 = get_projection_matrix(1)
    # P4 = get_projection_matrix(2)
    # P5 = get_projection_matrix(3)
    
    
    kpts_cam0, kpts_cam1, kpts_cam2, kpts_cam3, kpts_3d = run_mp(streams[0], streams[1], streams[2], streams[3], projections[0], projections[1], projections[2], projections[3])
    

    #this will create keypoints file in current working folder
    # write_keypoints_to_disk('kpts_cam0.dat', kpts_cam0)
    # write_keypoints_to_disk('kpts_cam1.dat', kpts_cam1)
    
    
    write_keypoints_to_disk('kpts_3d_pitch3_all.dat', kpts_3d)
    print('started')
    process_file("{}/{}/{}.bvh".format(fileLocation, args["calibration_id"], args["recording_id"]))

if __name__ == "__main__":
    
    #construct ap = argparse.ArgumentParser()
    ap = argparse.ArgumentParser()
    ap.add_argument("-path", "--path", type=str, required=True,
	                help="path to recording")
    ap.add_argument("-cal", "--calibration_id", type=str, required=True,
	                help="path to recording")
    ap.add_argument("-rec", "--recording_id", type=str, required=True,
	                help="path to recording")
    args = vars(ap.parse_args())
    main(args)