#make video from 120 to 60 fps
import cv2
import os
import numpy as np
import sys
import time



def main():
    # select the video file folder
    video_folder = "./public/motion/pitching/"
    #process all the video files in the folder
    for video_file in os.listdir(video_folder):
        print(video_file)
        if video_file.endswith(".MP4"):
            # read the video file
            video_path = os.path.join(video_folder, video_file)
            video = cv2.VideoCapture(video_path)
            # get the frame rate of the video
            fps = video.get(cv2.CAP_PROP_FPS)
            # get the frame size of the video
            frame_size = (int(video.get(cv2.CAP_PROP_FRAME_WIDTH)), int(video.get(cv2.CAP_PROP_FRAME_HEIGHT)))
            # get the number of frames in the video
            num_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
            # create a VideoWriter object
            out = cv2.VideoWriter(video_path.replace(".MP4", "_60fps.MP4"), cv2.VideoWriter_fourcc(*'mp4v'), 60, frame_size)
            # read the video frame by frame
            for i in range(num_frames):
                ret, frame = video.read()
                if not ret:
                    break
                # write the frame to the output video
                out.write(frame)
            # release the VideoWriter object
            out.release()
            # release the VideoCapture object
            video.release()
            # print the video file name
            print(video_file)

if __name__ == "__main__":
    main()