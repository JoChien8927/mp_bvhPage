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
import argparse


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

