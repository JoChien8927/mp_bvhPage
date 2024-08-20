import subprocess
from tqdm import tqdm

def run_script():
    types = ['bat', 'pitch']
    camera_inputs = {
        'bat': "1,2,3",
        'pitch': "4,7,8"
    }

    # 循环执行从 stage 9 到 stage 48
    to_run =[13,19,29,37,48]
    # for stage in tqdm(range(9, 49), desc="Processing Progress"):
    for stage in tqdm(to_run, desc="Processing Progress"):
        for t in types:
            print(f"Running script for stage {stage} with type {t}...")
            # 拼接命令和参数
            command = ['python', 'Rapgen_bvh.py', '-stage', str(stage), '-type', t]
            # 创建子进程，并传递 stdin 输入
            process = subprocess.Popen(
                command,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            # 获取对应 type 的摄像头输入，并发送到进程
            output, errors = process.communicate(input=camera_inputs[t])
            print("Output:", output)
            print("Errors:", errors)
            
            # 等待當前進程結束
            process.wait()

run_script()
