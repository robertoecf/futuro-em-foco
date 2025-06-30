import json
import os
import sys

from action_runner import execute_selenium_automation

# Adiciona o diretório 'src' ao path para que o action_runner possa ser importado
# Isso é necessário porque o Cursor executará este script a partir do diretório raiz do projeto.
sys.path.append(os.path.join(os.path.dirname(__file__)))

def send_response(response):
    """Envia uma resposta formatada em JSON-RPC para o stdout."""
    response_str = json.dumps(response)
    # O MCP requer que o tamanho da mensagem seja enviado primeiro
    sys.stdout.write(f"Content-Length: {len(response_str)}\r\n\r\n")
    sys.stdout.write(response_str)
    sys.stdout.flush()

def main():
    """
    Função principal que roda o loop do servidor MCP.
    """
    try:
        # Envia uma notificação para o Cursor informando que o servidor está pronto
        send_response({
            "jsonrpc": "2.0",
            "method": "window/logMessage",
            "params": {
                "type": 3, # 1: Error, 2: Warning, 3: Info, 4: Log
                "message": "Servidor Python+Selenium MCP está pronto."
            }
        })

        while True:
            # O protocolo MCP envia um cabeçalho Content-Length primeiro
            line = sys.stdin.readline()
            if not line:
                break
            
            content_length = int(line.strip().split(": ")[1])
            sys.stdin.readline() # Lê a linha em branco
            
            # Lê o corpo da requisição JSON
            body = sys.stdin.read(content_length)
            request = json.loads(body)

            # Processa a requisição (neste caso, uma chamada de ferramenta)
            if request.get("method") == "call-tool":
                params = request.get("params", {})
                url = params.get("url")
                actions = params.get("actions")

                if url and actions:
                    # Chama a automação com Selenium usando a nova estrutura
                    execute_selenium_automation(url, actions)
                    result_text = f"Sequência de automação para a URL '{url}' foi iniciada."
                    
                    # Retorna o resultado como um item de "conteúdo"
                    response = {
                        "jsonrpc": "2.0",
                        "id": request.get("id"),
                        "result": {
                            "content": [{"type": "text", "text": result_text}]
                        }
                    }
                else:
                    # Retorna um erro se os parâmetros estiverem faltando
                    response = {
                        "jsonrpc": "2.0",
                        "id": request.get("id"),
                        "error": {
                            "code": -32602,
                            "message": "Parâmetros 'url' e 'actions' (lista) são necessários."
                        }
                    }
                
                send_response(response)

    except Exception as e:
        # Se ocorrer um erro fatal, tenta enviar uma notificação de erro
        send_response({
            "jsonrpc": "2.0",
            "method": "window/logMessage",
            "params": {"type": 1, "message": f"Erro fatal no servidor MCP: {e}"}
        })

if __name__ == "__main__":
    main() 