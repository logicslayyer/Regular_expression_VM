import json
import os

def save_project_data(filepath, regex, test_cases):
    """
    Saves regex and test cases to a JSON file.
    """
    data = {"regex": regex, "test_cases": test_cases}
    try:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=4)
        return True, "Saved successfully!"
    except Exception as e:
        return False, str(e)

def load_project_data(filepath):
    """
    Loads regex and test cases from a JSON file.
    """
    if not os.path.exists(filepath):
        return False, "File not found.", "", []
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
            return True, "Loaded successfully!", data.get("regex", ""), data.get("test_cases", [])
    except Exception as e:
        return False, str(e), "", []
