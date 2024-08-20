import cv2
import numpy as np
import mediapipe as mp
from utils import DLT, get_projection_matrix, write_keypoints_to_disk, frameConcatenate
import os

def run_mp(input_stream1, input_stream2, input_stream3, input_stream4, P0, P1, P2, P3):

    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles
    mp_pose = mp.solutions.pose

    frame_shape = [1080, 1920]

    # add here if more keypoints are needed
    pose_keypoints = [16, 14, 12, 11, 13, 15, 24, 23, 25, 26, 27, 28]
    
    # input video stream
    print("Loading videos...")
    if not os.path.exists(input_stream1):
        print("File not found: ", input_stream1)
        return
    cap0 = cv2.VideoCapture(input_stream1)
    cap1 = cv2.VideoCapture(input_stream2)
    cap2 = cv2.VideoCapture(input_stream3)
    cap3 = cv2.VideoCapture(input_stream4)
    
    caps = [cap0, cap1, cap2, cap3]
    
    # get the video information
    fps = cap0.get(cv2.CAP_PROP_FPS)
    h = int(cap0.get(cv2.CAP_PROP_FRAME_HEIGHT))
    w = int(cap0.get(cv2.CAP_PROP_FRAME_WIDTH))
    size = (2*w, 2*h)
    
    # output
    # out = "media/boxing/output/test.mp4"
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
    print("Starting detection...")
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
        print("Detecting keypoints of camera 1...")
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
        print("Detecting keypoints of camera 2...")
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
        print("Detecting keypoints of camera 3...")
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
        print("Detecting keypoints of camera 4...")
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
        print("Triangulating...")
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
        print("Visualizing...")
        size = (2*w, 2*h)
        ConcatFrame = frameConcatenate(frame0, frame1, frame2, frame3, h, w)
        ConcatFrame = cv2.resize(ConcatFrame, size, interpolation=cv2.INTER_AREA)
        cv2.imshow('Concat Frame', ConcatFrame)
        # videoWriter.write(ConcatFrame)

        k = cv2.waitKey(1)
        if k & 0xFF == 27: break #27 is ESC key.


    cv2.destroyAllWindows()
    # videoWriter.release()
    for cap in caps:
        cap.release()


    return np.array(kpts_cam0), np.array(kpts_cam1), np.array(kpts_cam2), np.array(kpts_cam3), np.array(kpts_3d)

if __name__ == '__main__':
    print ("start creating .dat file...")
    print("Current working directory:", os.getcwd())
    

    ''' this will load the sample videos if no camera ID is given '''
    streams=[]
    for idx in [1,2,3,4]:
        streams.append("media/boxing/cam{}_9_back_10.mp4".format(idx))
    
    ''' get projection matrices '''
    cam_param_folder = './camera_parameters/boxing/'
    projection_matrix =[]
    for cam_idx in [1, 2, 3, 4]:
        intrinsic = "{}/cam{}.dat".format(cam_param_folder,cam_idx)
        extrinsic = "{}/rot_trans_cam{}.dat".format(cam_param_folder, cam_idx)
        projection_matrix.append(get_projection_matrix(intrinsic, extrinsic))
    
    ''' run mediapipe pose estimation and triangulation'''
    kpts_cam0, kpts_cam1, kpts_cam2, kpts_cam3, kpts_3d = run_mp(streams[0], streams[1],
                                                                 streams[2], streams[3], 
                                                                 projection_matrix[0], projection_matrix[1], 
                                                                 projection_matrix[2], projection_matrix[3])
    


    
    
    write_keypoints_to_disk('kpts_3d_boxing_test.dat', kpts_3d)
