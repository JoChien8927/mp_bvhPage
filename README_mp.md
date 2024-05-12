# Quick Start Guide
![3D_swing_Result](https://github.com/o2yang/Mediapipe3D/assets/56992354/44429949-7f16-43aa-ac36-90fc311c2afc)


## 1. Set the input video
* It is now constrained to 4 input video

###### `body3dpose.py`
```python=
    ''' the input video to do 3D reconstruction '''
    input_stream1 = 'media/20230908_bullpen/pitch/cam2-2.mp4'
    input_stream2 = 'media/20230908_bullpen/pitch/cam3-2.mp4'
    input_stream3 = 'media/20230908_bullpen/pitch/cam4-2.mp4'
    input_stream4 = 'media/20230908_bullpen/pitch/cam5-2.mp4'
```

## 2. Get the projection matrix
* get_projection_matrix(camera id, camera parameter directory)

###### `body3dpose.py`
```python=
    ''' get projection matrices '''
    camParamDirectory = './camera_parameters/20230908_bullpen/pitch/'
    P2 = get_projection_matrix(2, camParamDirectory)
    P3 = get_projection_matrix(3, camParamDirectory)
    P4 = get_projection_matrix(4, camParamDirectory)
    P5 = get_projection_matrix(5, camParamDirectory)
```
* you need to name the camera parameter file according to camera id
* take camera id = 2 for example:
* the instrinsic file will be named `c2.dat`, and the extrinsic file will be `rot_trans_c2.dat`
* you can see more details in `./camera_paramters`

## 3. 3D joint output
* it will save 3D joint to a `.dat` file
###### `body3dpose.py`
```python=
    write_keypoints_to_disk('./3D Joint Output/20230908_bullpen/pitch/keypoints_3d_pitch_all.dat', kpts_3d)
```

* function `read_keypoints(filename)` in utils.py can transfer the output 3D file to (frame * joint * coodinate) format
###### `utils.py`
```python=
    def read_keypoints(filename):
        pose_keypoints = np.array([16, 14, 12, 11, 13, 15, 24, 23, 25, 26, 27, 28])
        
        fin = open(filename, 'r')
    
        first = True
        kpts = []
        while(True):
            line = fin.readline()
            if line == '': break
    
            line = line.split()
            line = [float(s) for s in line]
    
            line = np.reshape(line, (len(pose_keypoints), -1))
            if first:
                print(line)
                print("------------------------------------------------------------------------------------")
                first = False
            kpts.append(line)
    
        kpts = np.array(kpts)
        return kpts
```
