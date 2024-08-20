# to rotate the video by 90 degrees

import cv2
import numpy as np
import os
def rotate_image(image, angle):
    # 取得圖像的高度和寬度
    (h, w) = image.shape[:2]
    # 計算圖像的中心點
    center = (w // 2, h // 2)
    # 取得旋轉矩陣
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    # 旋轉圖像
    rotated_image = cv2.warpAffine(image, M, (w, h))
    return rotated_image
 
# 示例: 將圖像旋轉 90 度
def rotateVid(vidPath, outPath):
    print("Rotating video by 90 degrees...")
    cap = cv2.VideoCapture(vidPath)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))    # 取得影像寬度
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))  # 取得影像高度
    fps = cap.get(cv2.CAP_PROP_FPS)                   # 取得影像幀率
    fourcc = cv2.VideoWriter_fourcc('m', 'p', '4', 'v')
    out = cv2.VideoWriter(outPath, fourcc, fps, (width, height))

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow('frame_before', frame)
        rotated_frame = rotate_image(frame, 90)

        # frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
        # show 
        cv2.imshow('frame', rotated_frame)
        out.write(rotated_frame)

    cap.release()
    out.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    vidPath = './public/exp/pj/cam2_.mp4'
    outPath = './public/exp/pj/cam2.mp4'
    rotateVid(vidPath, outPath)