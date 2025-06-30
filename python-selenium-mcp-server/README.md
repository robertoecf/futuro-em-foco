# Python Selenium MCP Server

A simple yet powerful server that listens for JSON-RPC messages to perform web automation tasks using Selenium. It acts as a local "agent" that can be controlled by another process (like a remote LLM) to securely interact with websites, using credentials stored locally.

## Features

- **Secure Credential Management**: Uses a local `.env` file to handle secrets. Sensitive data never leaves your machine.
- **Dynamic Action Execution**: Receives a list of actions (like "type", "click", "navigate") in a structured JSON format, allowing for complex automation sequences.
- **Dynamic `.env` Discovery**: Automatically finds the `.env` file in the project's root directory, making the server portable.
- **Extensible**: Designed to be easily extended with new actions and selectors.

## Prerequisites

- Python 3.7+
- `pip` for package management

## Installation

1.  **Navigate to the server directory:**
    ```bash
    cd python-selenium-mcp-server
    ```

2.  **Install the required dependencies:**
    ```bash
    pip3 install -r requirements.txt
    ```

## Configuration

The server requires a `.env` file in the root of the **main project folder** (`futuro-em-foco-planner`) to load secrets like passwords or API keys.

1.  Create a file named `.env` in the project root (`/Users/mac/Documents/futuro-em-foco-planner/.env`).
2.  Add your secrets in `KEY=VALUE` format. See `.env.example` for reference.

**Example `.env` file:**
```
GITHUB_PASSWORD="your_super_secret_password"
ANOTHER_API_KEY="another_secret_value"
```

## Usage

Run the server from the main project root directory:

```bash
python3 python-selenium-mcp-server/src/mcp_server.py
```

The server will start and wait for JSON-RPC messages on its standard input.

### API: The `call-tool` Method

The server exposes a single method, `call-tool`, which accepts a JSON object with a `url` and a list of `actions`.

**Request Format:**

The entire request must be sent as a single line, prefixed with `Content-Length`.

```json
{"jsonrpc": "2.0", "method": "call-tool", "params": {"url": "...", "actions": [...]}, "id": 1}
```

**`actions` Array Schema:**

Each object in the `actions` array defines a single step in the automation.

| Key        | Type     | Description                                                                 | Required |
| :--------- | :------- | :-------------------------------------------------------------------------- | :------- |
| `action`   | `string` | The type of action to perform. Supported: `navigate`, `type`, `click`.      | Yes      |
| `selector` | `object` | A dictionary defining how to find the element. See **Selector Schema**.     | For `type`, `click` |
| `text`     | `string` | The literal text to type into an element. Use this OR `secret`.             | For `type` |
| `secret`   | `string` | The key of a secret in your `.env` file to type. Use this OR `text`.       | For `type` |
| `url`      | `string` | The URL to navigate to.                                                     | For `navigate` |


**Selector Schema:**

| Key     | Type     | Description                                         |
| :------ | :------- | :-------------------------------------------------- |
| `by`    | `string` | The method to find the element. E.g., `id`, `name`, `xpath`, `css`. |
| `value` | `string` | The value of the selector (e.g., the element's ID or name). |

### Example: GitHub Login

Here is the JSON object for the `params` that would log into GitHub:

```json
{
  "url": "https://github.com/login",
  "actions": [
    {
      "action": "type",
      "selector": { "by": "id", "value": "login_field" },
      "text": "your-email@example.com"
    },
    {
      "action": "type",
      "selector": { "by": "id", "value": "password" },
      "secret": "GITHUB_PASSWORD"
    },
    {
      "action": "click",
      "selector": { "by": "name", "value": "commit" }
    }
  ]
}
``` 