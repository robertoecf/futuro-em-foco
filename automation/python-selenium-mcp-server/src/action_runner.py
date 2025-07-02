import json
import os
import time
from pathlib import Path
from typing import Dict, List, TypedDict

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager


def find_dotenv():
    """
    Finds the .env file by searching upward from the current script's directory.
    """
    current_dir = Path(__file__).parent
    while current_dir != current_dir.parent:
        dotenv_path = current_dir / ".env"
        if dotenv_path.exists():
            return dotenv_path
        current_dir = current_dir.parent
    # If not found, check the project root passed by the user as a last resort
    # This path might be specific to the user's setup
    # In our case: /Users/mac/Documents/futuro-em-foco-planner
    project_root_dotenv = Path("/Users/mac/Documents/futuro-em-foco-planner/.env")
    if project_root_dotenv.exists():
        return project_root_dotenv
    return None

def manual_load_dotenv(path):
    """
    Lê um arquivo .env manualmente e carrega suas variáveis no ambiente.
    """
    try:
        with open(path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip().strip('"\'') # Remove aspas
                    os.environ[key] = value
    except FileNotFoundError:
        pass

def get_element(driver, selector):
    """Finds an element based on the selector dictionary."""
    by_map = {
        "id": By.ID,
        "name": By.NAME,
        "xpath": By.XPATH,
        "css": By.CSS_SELECTOR,
        "class_name": By.CLASS_NAME,
        "link_text": By.LINK_TEXT,
    }
    by = by_map.get(selector["by"].lower())
    if not by:
        raise ValueError(f"Unsupported selector strategy: {selector['by']}")
    return driver.find_element(by, selector["value"])

def execute_selenium_automation(url: str, actions: list):
    """
    Automates a sequence of web interactions using Selenium based on a list of action dictionaries.
    
    Parameters:
        url (str): The initial URL to open in the browser.
        actions (list): A list of dictionaries specifying actions such as typing text, clicking elements, or navigating to URLs. Each action dictionary should define the action type and relevant parameters.
    
    The function loads environment variables from a `.env` file if present, executes each action in order, and prints a JSON-formatted status message upon completion or error. The browser is closed after execution.
    """
    dotenv_path = find_dotenv()
    if dotenv_path:
        manual_load_dotenv(dotenv_path)
    
    driver = None
    try:
        driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()))
        driver.get(url)
        time.sleep(2) # Wait for initial page load

        for action_item in actions:
            action_type = action_item.get("action")
            
            if action_type == "type":
                element = get_element(driver, action_item["selector"])
                text_to_type = ""
                if "text" in action_item:
                    text_to_type = action_item["text"]
                elif "secret" in action_item:
                    secret_key = action_item["secret"]
                    value_from_env = os.getenv(secret_key)
                    if value_from_env is None:
                        raise ValueError(f"Secret key '{secret_key}' not found in .env file.")
                    text_to_type = value_from_env
                
                element.send_keys(text_to_type)

            elif action_type == "click":
                element = get_element(driver, action_item["selector"])
                element.click()

            elif action_type == "navigate":
                driver.get(action_item["url"])

            else:
                raise ValueError(f"Unsupported action type: {action_type}")
            
            time.sleep(1) # Wait a bit after each action

        print(json.dumps({"status": "success", "message": "All actions executed successfully."}))

    except Exception as e:
        print(json.dumps({"status": "error", "message": f"An error occurred during Selenium automation: {str(e)}"}))
    finally:
        if driver:
            time.sleep(3) # Keep browser open for a few seconds to observe result
            driver.quit()

if __name__ == '__main__':

    class ActionDict(TypedDict, total=False):
        action: str
        selector: Dict[str, str]
        text: str
        secret: str
        url: str

    class PayloadDict(TypedDict):
        url: str
        actions: List[ActionDict]

    # Example for direct testing of this script
    test_payload: PayloadDict = {
        "url": "https://github.com/login",
        "actions": [
            {
                "action": "type",
                "selector": {"by": "id", "value": "login_field"},
                "text": "robertoecf@gmail.com"
            },
            {
                "action": "type",
                "selector": {"by": "id", "value": "password"},
                "secret": "GITHUB_PASSWORD"
            },
            {
                "action": "click",
                "selector": {"by": "name", "value": "commit"}
            }
        ]
    }
    
    print("--- Running Direct Test of action_runner.py ---")
    execute_selenium_automation(test_payload["url"], test_payload["actions"])
    print("--- Test Finished ---") 