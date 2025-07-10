# Inventário de MCPs Instalados (Ambiente Cursor)

## Resumo dos MCPs Ativos

| Nome MCP    | Função Principal                                                        | Comando/Localização                                 | Status     |
|-------------|-------------------------------------------------------------------------|-----------------------------------------------------|------------|
| github      | Integração e automação com GitHub (PRs, issues, workflows, CI/CD, etc.) | ghcr.io/github/github-mcp-server (Docker)           | Instalado  |
| mcp-proxy   | Proxy/orquestrador de comandos entre agentes e sistemas (roteamento MCP) | mcpproxy (Python, executado via python3.13)         | Instalado  |
| supabase    | Automação e operações avançadas no Supabase (migrations, edge functions, dados) | @supabase/mcp-server-supabase (npx, Node.js) | Instalado  |


## Detalhes Técnicos dos MCPs

### 1. github
- **Função:** Agente MCP para integração total com GitHub. Permite automação de Pull Requests, issues, revisões, status de CI/CD, e execução de workflows. Usado para orquestrar operações de repositório, automação de qualidade, e integração contínua.
- **Comando:** Executado via Docker com a imagem ghcr.io/github/github-mcp-server.
- **Autenticação:** Requer GitHub Personal Access Token.

### 2. mcp-proxy
- **Função:** Proxy/orquestrador central de comandos MCP. Faz roteamento entre diferentes agentes, permitindo integração entre sistemas heterogêneos (ex: frontend, backend, automações externas).
- **Comando:** Executado via Python 3.13, módulo mcpproxy.
- **Configuração:** Usa arquivo MCPPROXY_CONFIG_PATH para definir rotas e integrações.

#### MCPs configurados no mcp-proxy (mcp_proxy.json):

| MCP               | Função Principal                                                        | Exemplos de Ferramentas Típicas*                |
|-------------------|-------------------------------------------------------------------------|-------------------------------------------------|
| context7          | Análise de contexto, embeddings, busca semântica                        | semantic_search, embedding_generate, etc.       |
| browser-tools     | Diagnóstico e manipulação de navegador                                  | getConsoleLogs, getNetworkErrors, takeScreenshot|
| selenium          | Automação web (Selenium)                                                | click_element, double_click, input_text, hover  |
| playwright        | Automação web avançada (Playwright)                                     | goto, screenshot, fill, evaluate, etc.          |
| sequential-thinking| Execução de fluxos lógicos, raciocínio encadeado                       | run_sequence, chain_tools, etc.                 |
| firecrawl         | Crawling, scraping, geração de llms.txt                                 | generate_llmstxt, crawl_site, extract_content   |
| filesystem        | Manipulação de arquivos e diretórios                                    | read_file, write_file, list_dir, delete_file    |
| postgres          | Operações em banco PostgreSQL                                           | execute_sql, list_tables, run_migration         |
| docker            | Gerenciamento de containers Docker                                      | list_containers, start_container, exec_in_container |

*As ferramentas disponíveis dependem do pool ativo no momento. Para listar as ferramentas realmente disponíveis, use o comando retrieve_tools.

### 3. supabase
- **Função:** Agente MCP para automação e operações avançadas no Supabase. Gerencia migrations, deploy de edge functions, execução de SQL, manipulação de dados, autenticação, e storage.
- **Comando:** Executado via npx com o pacote @supabase/mcp-server-supabase.
- **Autenticação:** Requer Supabase Access Token.
- **Modo:** Executado em modo read-only (parâmetro --read-only).


## Espaço para Novos MCPs

Adicione abaixo novos MCPs conforme forem instalados:

| Nome MCP        | Função Principal | Comando/Localização | Status |
|-----------------|------------------|---------------------|--------|
|                 |                  |                     |        |
