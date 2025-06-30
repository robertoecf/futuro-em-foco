#!/usr/bin/env node

const readline = require('readline');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

// --- Teste de Log ---
const logFilePath = path.join(__dirname, '..', 'proxy_debug.log');
fs.appendFileSync(logFilePath, `Servidor Proxy EXECUTOR iniciado em: ${new Date().toISOString()}\\n`);
// --- Fim do Teste de Log ---

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

// Envia uma mensagem de que o servidor está pronto.
sendResponse({
  jsonrpc: '2.0',
  method: 'window/logMessage',
  params: { type: 3, message: 'Servidor Proxy Executor está pronto.' }
});

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
                processRequest(buffer);
                break;
            }
        }
    };
    process.stdin.on('readable', onReadable);
    // Dispara a leitura inicial
    onReadable();
  }
});

function processRequest(rawRequest) {
    // Pula a linha em branco após o cabeçalho
    const requestBody = rawRequest.substring(rawRequest.indexOf('{'));
    const request = JSON.parse(requestBody);

    if (request.method === 'call-tool') {
        const { url, instruction } = request.params;

        if (url && instruction) {
            // Constrói o caminho absoluto para o projeto
            const projectRoot = path.resolve(__dirname, '..'); 
            const scriptPath = path.join(projectRoot, 'python-selenium-mcp-server', 'src', 'action_runner.py');
            const venvPythonPath = path.join(projectRoot, 'python-selenium-mcp-server', 'venv', 'bin', 'python');
            
            // Constrói o comando de terminal com aspas para lidar com espaços nos caminhos
            const commandToExecute = `"${venvPythonPath}" "${scriptPath}" "${url}" "${instruction}"`;

            exec(commandToExecute, (error, stdout, stderr) => {
                if (error) {
                    sendResponse({
                        jsonrpc: '2.0',
                        id: request.id,
                        result: { content: [{ type: 'text', text: `Erro ao executar script Python: ${error.message}` }] }
                    });
                    return;
                }
                if (stderr) {
                    sendResponse({
                        jsonrpc: '2.0',
                        id: request.id,
                        result: { content: [{ type: 'text', text: `Erro no script Python: ${stderr}` }] }
                    });
                    return;
                }

                try {
                    const pyResult = JSON.parse(stdout);
                    sendResponse({
                        jsonrpc: '2.0',
                        id: request.id,
                        result: { content: [{ type: 'text', text: `[${pyResult.status}] ${pyResult.message}` }] }
                    });
                } catch (parseError) {
                    sendResponse({
                        jsonrpc: '2.0',
                        id: request.id,
                        result: { content: [{ type: 'text', text: `Erro ao parsear a saída do Python: ${stdout}` }] }
                    });
                }
            });
        } else {
            sendResponse({
                jsonrpc: '2.0',
                id: request.id,
                error: { code: -32602, message: 'Parâmetros "url" e "instruction" são necessários.' }
            });
        }
    }
} 