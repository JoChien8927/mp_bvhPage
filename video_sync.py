import cv2
import os
import numpy as np

hit_id = 199
cam1 = cv2.VideoCapture(os.path.join('new_videos', f'cam_1_{hit_id}.mp4'))
cam2 = cv2.VideoCapture(os.path.join('new_videos', f'cam_2_{hit_id}.mp4'))
cam4 = cv2.VideoCapture(os.path.join('new_videos', f'cam_4_{hit_id}.mp4'))
cam5 = cv2.VideoCapture(os.path.join(f'id{hit_id}', f'cam_5_{hit_id}.mp4'))
cam6 = cv2.VideoCapture(os.path.join(f'id{hit_id}', f'cam_6_{hit_id}.mp4'))

new_cam1 = cv2.VideoWriter(os.path.join('sync_videos', f'cam_1_{hit_id}.mp4'), cv2.VideoWriter_fourcc(*'mp4v'), 150, (720, 540))
new_cam2 = cv2.VideoWriter(os.path.join('sync_videos', f'cam_2_{hit_id}.mp4'), cv2.VideoWriter_fourcc(*'mp4v'), 150, (720, 540))
new_cam4 = cv2.VideoWriter(os.path.join('sync_videos', f'cam_4_{hit_id}.mp4'), cv2.VideoWriter_fourcc(*'mp4v'), 150, (1000, 1070))
new_cam5 = cv2.VideoWriter(os.path.join('sync_videos', f'cam_5_{hit_id}.mp4'), cv2.VideoWriter_fourcc(*'mp4v'), 150, (2448, 1400))
new_cam6 = cv2.VideoWriter(os.path.join('sync_videos', f'cam_6_{hit_id}.mp4'), cv2.VideoWriter_fourcc(*'mp4v'), 150, (2448, 1400))

frame_id = 1

# drop 150 frames for cam5 and cam6
for i in range(150):
    cam5.read()
    cam6.read()

while True:

    ret1, frame1 = cam1.read()
    ret2, frame2 = cam2.read()
    ret4, frame4 = cam4.read()
    ret5, frame5 = cam5.read()
    ret6, frame6 = cam6.read()

    if not ret4 or not ret5 or not ret6 or not ret1 or not ret2:
        break
    
    
    new_cam1.write(frame1)
    new_cam2.write(frame2)
    new_cam4.write(frame4)
    new_cam5.write(frame5)
    new_cam6.write(frame6)
    frame = np.zeros((1440, 2224, 3), dtype=np.uint8)
    frame5 = cv2.resize(frame5, (1224, 720))
    frame6 = cv2.resize(frame6, (1224, 720))
    frame[:1070,:1000] = frame4
    frame[:720, 1000:] = frame5
    frame[720:, 1000:] = frame6

    cv2.imshow('frame', frame)
    frame_id += 1
    if cv2.waitKey(0) & 0xFF == ord('q'):
        break

