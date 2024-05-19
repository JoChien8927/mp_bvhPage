import cv2
import os
import numpy as np


def _make_homogeneous_rep_matrix(R, t):
    P = np.zeros((4,4))
    P[:3,:3] = R
    P[:3, 3] = t.reshape(3)
    P[3,3] = 1
    return P

#direct linear transform
def DLT(P1, P2, P3, P4, point1, point2, point3, point4):

    ''' Solve AX=0 '''
    A = [point1[1]*P1[2,:] - P1[1,:],
         P1[0,:] - point1[0]*P1[2,:],
         point2[1]*P2[2,:] - P2[1,:],
         P2[0,:] - point2[0]*P2[2,:],
         point3[1]*P3[2,:] - P3[1,:],
         P3[0,:] - point3[0]*P3[2,:],
         point4[1]*P4[2,:] - P4[1,:],
         P4[0,:] - point4[0]*P4[2,:]
        ]
    # print('Before A')
    # print(A)
    A = np.array(A).reshape((8,4))
    # print('After A')
    # print(A)
    # print('----------------------------------------------')
    

    B = A.transpose() @ A
    from scipy import linalg
    U, s, Vh = linalg.svd(B, full_matrices = False)

    # print('Triangulated point: ')
    return_Point = Vh[3,0:3]/Vh[3,3]
    return_Point[1] = return_Point[1] * -1.0
    
    return return_Point

def read_camera_parameters(intrinsic):
    inf = open(intrinsic, 'r')
    # inf = open('camera_parameters/bullpen/c' + str(camera_id) + '.dat', 'r')
    cmtx = []
    dist = []

    line = inf.readline()
    for _ in range(3):
        line = inf.readline().split()
        line = [float(en) for en in line]
        cmtx.append(line)

    line = inf.readline()
    line = inf.readline().split()
    line = [float(en) for en in line]
    dist.append(line)

    return np.array(cmtx), np.array(dist)

def read_rotation_translation(extrinsic):
    
    inf = open(extrinsic, 'r')

    # inf = open(savefolder + 'rot_trans_c'+ str(camera_id) + '.dat', 'r')

    inf.readline()
    rot = []
    trans = []
    for _ in range(3):
        line = inf.readline().split()
        line = [float(en) for en in line]
        rot.append(line)

    inf.readline()
    for _ in range(3):
        line = inf.readline().split()
        line = [float(en) for en in line]
        trans.append(line)

    inf.close()
    return np.array(rot), np.array(trans)

def _convert_to_homogeneous(pts):
    pts = np.array(pts)
    if len(pts.shape) > 1:
        w = np.ones((pts.shape[0], 1))
        return np.concatenate([pts, w], axis = 1)
    else:
        return np.concatenate([pts, [1]], axis = 0)

def get_projection_matrix(intrisnic, extrinsic):

    #read camera parameters
    cmtx, dist = read_camera_parameters(intrisnic)
    rvec, tvec = read_rotation_translation(extrinsic)

    #calculate projection matrix
    P = cmtx @ _make_homogeneous_rep_matrix(rvec, tvec)[:3,:]
    return P

def write_keypoints_to_disk(filename, kpts):
    fout = open(filename, 'w')
    try:
        print(f"Data written to {filename}")
    except Exception as e:
        print(f"Failed to write data to {filename}: {e}")
        
    for frame_kpts in kpts:
        for kpt in frame_kpts:
            if len(kpt) == 2:
                fout.write(str(kpt[0]) + ' ' + str(kpt[1]) + ' ')
            else:
                fout.write(str(kpt[0]) + ' ' + str(kpt[1]) + ' ' + str(kpt[2]) + ' ')

        fout.write('\n')
    fout.close()

def frameConcatenate(f1, f2, f3, f4, h, w):
    dim = (w, h)
    
    
    f2 = cv2.resize(f2, dim, interpolation=cv2.INTER_AREA)
    f3 = cv2.resize(f3, dim, interpolation=cv2.INTER_AREA)
    f4 = cv2.resize(f4, dim, interpolation=cv2.INTER_AREA)
    background = cv2.resize(f1, (2*w, 2*h), interpolation=cv2.INTER_AREA)
    background[0:h, 0:w] = f1
    background[0:h, w:2*w] = f2
    background[h:2*h, 0:w] = f3
    background[h:2*h, w:2*w] = f4
    
    return (background)

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

def MPJPE(gt_filename, cp_filename):
    gt_p3ds = read_keypoints(gt_filename)
    cp_p3ds = read_keypoints(cp_filename)
    
    frame_amount = gt_p3ds.shape[0]
    joint_amount = gt_p3ds.shape[1]
    total_mpjpe = 0
    for frame_num in range(frame_amount):
        mpjpe = 0
        for joint_num in range(joint_amount):
            point1 = np.array(gt_p3ds[frame_num][joint_num])
            point2 = np.array(cp_p3ds[frame_num][joint_num])
            
            L2_distance = np.linalg.norm(point1 - point2)
            mpjpe += L2_distance
        total_mpjpe +=(mpjpe/ joint_amount)
        
    total_mpjpe /= frame_amount
    
    print("total_mpjpe: ", total_mpjpe)

def read_keypoints(filename):
    pose_keypoints = np.array([16, 14, 12, 11, 13, 15, 24, 23, 25, 26, 27, 28])
    
    fin = open(filename, 'r')

    kpts = []
    while(True):
        line = fin.readline()
        if line == '': break

        line = line.split()
        line = [float(s) for s in line]

        # line = np.reshape(line, (len(pose_keypoints), -1))
        line = np.reshape(line, (33, -1))
        
        kpts.append(line)

    kpts = np.array(kpts)
    # print(kpts)
    return kpts

from bvh_skeleton import mediapipe_skeleton

def write_mediapipe_bvh(outbvhfilepath,indatfilepath):

    prediction3dpoint = read_keypoints(indatfilepath)
    print(prediction3dpoint.shape)


    # �?�?�??????��?�大100???
    for frame in prediction3dpoint:
        # print(frame)
        for point3d in frame:
            # print(point3d)
            point3d[0] *= 100
            point3d[1] *= 100
            point3d[2] *= 100
        # print('-----------------------------------')


    dir_name = os.path.dirname(outbvhfilepath)
    basename = os.path.basename(outbvhfilepath)
    video_name = basename[:basename.rfind('.')]
    bvhfileDirectory = os.path.join(dir_name,video_name,"bvh")
    if not os.path.exists(bvhfileDirectory):
        os.makedirs(bvhfileDirectory)
    bvhfileName = os.path.join(dir_name,video_name,"bvh","{}.bvh".format(video_name))
    skeleton = mediapipe_skeleton.MediapipeSkeleton()
    skeleton.poses2bvh(prediction3dpoint,output_file=bvhfileName)



if __name__ == '__main__':

    write_mediapipe_bvh('./bvhOutput', './3D Joint Output/kpts_3d_pitch3_all.dat')


