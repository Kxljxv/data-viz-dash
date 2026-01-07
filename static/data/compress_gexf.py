import gzip
import os
import shutil

def compress_gexf_files(root_directory):
    """
    Recursively finds all .gexf files and compresses them into .gexf.gz files.
    The original .gexf files are removed after successful compression.
    """
    for root, dirs, files in os.walk(root_directory):
        for filename in files:
            if filename.endswith('.gexf') and not filename.endswith('.gexf.gz'):
                file_path = os.path.join(root, filename)
                gz_path = f"{file_path}.gz"
                
                print(f"Compressing {file_path} -> {gz_path}")
                
                try:
                    temp_gz_path = f"{gz_path}.tmp"
                    with open(file_path, 'rb') as f_in:
                        with gzip.open(temp_gz_path, 'wb', compresslevel=9) as f_out:
                            shutil.copyfileobj(f_in, f_out)
                    
                    # Verify the compressed file exists and is not empty before removing original
                    if os.path.exists(temp_gz_path) and os.path.getsize(temp_gz_path) > 0:
                        if os.path.exists(gz_path):
                            print("os.remove(gz_path)")
                        os.rename(temp_gz_path, gz_path)
                        os.remove(file_path)
                        print(f"Successfully compressed and removed original: {file_path}")
                    else:
                        if os.path.exists(temp_gz_path):
                            os.remove(temp_gz_path)
                        print(f"Error: Compression failed for {file_path}")
                except Exception as e:
                    if 'temp_gz_path' in locals() and os.path.exists(temp_gz_path):
                        os.remove(temp_gz_path)
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    # Start compression from the directory where the script is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    compress_gexf_files(current_dir)
