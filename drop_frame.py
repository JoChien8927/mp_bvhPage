import os
import cv2

folders = ['id199', 'id332']
ids = [199, 332]
cam_id = 2
for i, folder in enumerate(folders):

    cam = cv2.VideoCapture(os.path.join(folder, f'cam_{cam_id}_{ids[i]}.mp4'))
    
    new_cam = cv2.VideoWriter(os.path.join('new_videos', f'cam_{cam_id}_{ids[i]}.mp4'), cv2.VideoWriter_fourcc(*'mp4v'), 150, (720, 540))

    frame_id = 1
    while True:

        suc, frame = cam.read()

        if not suc:
            break

        if frame_id % 2 != 0:
            new_cam.write(frame)
        
        frame_id += 1

    cam.release()
    new_cam.release()

print('Done!')
