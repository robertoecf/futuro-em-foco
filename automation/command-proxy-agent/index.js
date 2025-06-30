#!/usr/bin/env node

const readline = require('readline');
const path = require('path');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function sendResponse(response) {
  const responseStr = JSON.stringify(response);
  const headers = `Content-Length: ${Buffer.byteLength(responseStr, 'utf-8')}\\r\\n\\r\\n`;
  process.stdout.write(headers + responseStr);
}

// Não envia 'initialize' response, apenas aguarda por comandos.
// Isso emula o estado em que a automação funcionava.

rl.on('line', (line) => {
  if (line.startsWith('Content-Length')) {
    const length = parseInt(line.split(':')[1].trim(), 10);
    let buffer = '';
    let bytesRead = 0;

    const onReadable = () => {
        let chunk;
        while (null !== (chunk = process.stdin.read())) {
            bytesRead += chunk.length;
            buffer += chunk;
            if (bytesRead >= length) {
                process.stdin.removeListener('readable', onReadable);
                // Pula a linha em branco do header
                const requestBody = buffer.substring(buffer.indexOf('{'));
                processRequest(JSON.parse(requestBody));
                break;
            }
        }
    };
    process.stdin.on('readable', onReadable);
    onReadable();
  }
});

function processRequest(request) {
    if (request.method === 'run-automation') {
        const projectRoot = path.resolve(__dirname, '..');
        const scriptPath = path.join(projectRoot, 'python-selenium-mcp-server', 'src', 'action_runner.py');
        const venvPythonPath = path.join(projectRoot, 'python-selenium-mcp-server', 'venv', 'bin', 'python');

        const commandToExecute = `"${venvPythonPath}" "${scriptPath}" --url "https://github.com/login" --user "teste" --password "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"`;

        exec(commandToExecute, (error, stdout, stderr) => {
            if (error) {
                sendResponse({ jsonrpc: '2.0', id: request.id, error: { code: -32000, message: `Erro ao executar automação: ${error.message}` } });
                return;
            }
            if (stderr) {
                sendResponse({ jsonrpc: '2.0', id: request.id, error: { code: -32000, message: `Erro no script de automação: ${stderr}` } });
                return;
            }
            sendResponse({ jsonrpc: '2.0', id: request.id, result: { output: stdout } });
        });
    } else if (request.method === 'call-tool') {
        const { url, actions } = request.params;

        if (url && actions) {
            const projectRoot = path.resolve(__dirname, '..');
            const scriptPath = path.join(projectRoot, 'python-selenium-mcp-server', 'src', 'action_runner.py');
            const venvPythonPath = path.join(projectRoot, 'python-selenium-mcp-server', 'venv', 'bin', 'python');
            
            const payload = { url, actions };
            const payloadString = JSON.stringify(payload);

            const commandToExecute = `"${venvPythonPath}" "${scriptPath}" '${payloadString}'`;

            exec(commandToExecute, (error, stdout, stderr) => {
                if (error || stderr) {
                    sendResponse({ jsonrpc: '2.0', id: request.id, result: { content: [{ type: 'text', text: `Erro: ${error ? error.message : stderr}` }] } });
                    return;
                }
                try {
                    const pyResult = JSON.parse(stdout);
                    sendResponse({ jsonrpc: '2.0', id: request.id, result: { content: [{ type: 'text', text: `[${pyResult.status}] ${pyResult.message}` }] } });
                } catch (parseError) {
                    sendResponse({ jsonrpc: '2.0', id: request.id, result: { content: [{ type: 'text', text: `Saída não-JSON do Python: ${stdout}` }] } });
                }
            });
        } else {
            sendResponse({ jsonrpc: '2.0', id: request.id, error: { code: -32602, message: 'Parâmetros "url" e "actions" são necessários.' } });
        }
    } else {
        sendResponse({ jsonrpc: '2.0', id: request.id, error: { code: -32603, message: `Método não encontrado: ${request.method}` } });
    }
}