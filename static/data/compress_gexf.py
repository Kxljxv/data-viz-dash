import gzip
import os
import shutil

def update_gitignore(root_directory):
    """Adds *.gexf to .gitignore if not already present."""
    gitignore_path = os.path.join(os.path.dirname(root_directory), ".gitignore")
    # Also check the root directory if it's two levels up
    root_gitignore = os.path.join(os.path.dirname(os.path.dirname(root_directory)), ".gitignore")
    
    paths_to_check = [gitignore_path, root_gitignore]
    
    for path in paths_to_check:
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if "*.gexf" not in content:
                print(f"  Adding *.gexf to {path}")
                with open(path, 'a', encoding='utf-8') as f:
                    if not content.endswith('\n'):
                        f.write('\n')
                    f.write('*.gexf\n')

def compress_gexf_files(root_directory):
    """
    Recursively finds all .gexf files, creates a folder for each,
    copies the original there, compresses it, and adds a descriptions.yaml.
    """
    # Ensure .gexf is ignored in git
    update_gitignore(root_directory)
    
    # First, collect all .gexf files to avoid recursion issues
    gexf_files = []
    for root, dirs, files in os.walk(root_directory):
        for filename in files:
            if filename.endswith('.gexf') and not filename.endswith('.gz'):
                # Skip if already in a folder with the same name
                parent_dir = os.path.basename(root)
                base_name = os.path.splitext(filename)[0]
                if parent_dir == base_name:
                    continue
                gexf_files.append(os.path.join(root, filename))

    for file_path in gexf_files:
        root = os.path.dirname(file_path)
        filename = os.path.basename(file_path)
        base_name = os.path.splitext(filename)[0]
        
        # Create new folder
        new_folder_path = os.path.join(root, base_name)
        os.makedirs(new_folder_path, exist_ok=True)
        
        target_gexf_path = os.path.join(new_folder_path, filename)
        gz_path = f"{target_gexf_path}.gz"
        yaml_path = os.path.join(new_folder_path, "descriptions.yaml")
        
        print(f"Processing {file_path}")
        
        try:
            # 1. Copy original .gexf file to the new folder (don't delete)
            print(f"  Copying {filename} -> {new_folder_path}")
            shutil.copy2(file_path, target_gexf_path)
            
            # 2. Compress .gexf to .gexf.gz in the new folder
            print(f"  Compressing -> {gz_path}")
            with open(target_gexf_path, 'rb') as f_in:
                with gzip.open(gz_path, 'wb', compresslevel=9) as f_out:
                    shutil.copyfileobj(f_in, f_out)
            
            # 3. Create/Update descriptions.yaml in the new folder
            if not os.path.exists(yaml_path):
                print(f"  Creating {yaml_path}")
                # Default content
                yaml_content = f"{base_name}:\n  short: \"\"\n  medium: \"\"\n  long: \"\"\n  nodes: 0\n  edges: 0\n"
                
                # Try to find existing info in the main descriptions.yaml
                main_yaml_path = os.path.join(root_directory, "descriptions.yaml")
                if os.path.exists(main_yaml_path):
                    try:
                        with open(main_yaml_path, 'r', encoding='utf-8') as f:
                            main_lines = f.readlines()
                        
                        found_entry = False
                        entry_lines = []
                        for i, line in enumerate(main_lines):
                            if line.startswith(f"{base_name}:"):
                                found_entry = True
                                entry_lines.append(line)
                                # Capture indented lines following the key
                                for next_line in main_lines[i+1:]:
                                    if next_line.startswith(' ') or next_line.strip() == '':
                                        entry_lines.append(next_line)
                                    else:
                                        break
                                break
                        
                        if found_entry:
                            yaml_content = "".join(entry_lines)
                            print(f"  Found entry for {base_name} in main descriptions.yaml")
                    except Exception as e:
                        print(f"  Warning: Could not read main descriptions.yaml: {e}")
                
                with open(yaml_path, 'w', encoding='utf-8') as f:
                    f.write(yaml_content)
            
            print(f"  Successfully processed {base_name}")
            
        except Exception as e:
            print(f"  Error processing {file_path}: {e}")

if __name__ == "__main__":
    # Start compression from the directory where the script is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    compress_gexf_files(current_dir)
