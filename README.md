# Welcome to your Lovable project

## Project info

**URL**: [https://lovable.dev/projects/acd4e9cf-8db5-4a40-a87c-ae282d010ac4](https://lovable.dev/projects/acd4e9cf-8db5-4a40-a87c-ae282d010ac4)

## How can I edit this code?

There are several ways of editing your application.

### Use Lovable

Simply visit the [Lovable Project](https://lovable.dev/projects/acd4e9cf-8db5-4a40-a87c-ae282d010ac4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

### Use your preferred IDE

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Edit a file directly in GitHub

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

### Use GitHub Codespaces

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Environment variables

Create a `.env` file based on `.env.example` and provide values for the following keys:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `POSTHOG_TOKEN`
- `POSTHOG_HOST` (defaults to `https://us.i.posthog.com` if unset)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/acd4e9cf-8db5-4a40-a87c-ae282d010ac4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Running the Flask demo

The repository includes a small Flask application under `flask_app/` with an example
endpoint available at `/home`. To view it locally, generate the Tailwind CSS
stylesheet and start the Flask development server in separate terminals:

```sh
npx tailwindcss -i ./flask_app/static/input.css -o ./flask_app/static/styles.css --watch
FLASK_APP=flask_app/app.py flask run
```

The resulting `flask_app/static/styles.css` file is generated at runtime and is
ignored by Git, so it should not be committed.

## Estrutura e Convenções do Projeto (2024)

### Organização de Pastas

- `src/features/` — Organização por domínios/funcionalidades (ex: planning, data-visualization, analytics, etc.)
  - Cada feature pode conter: `components/`, `hooks/`, `services/`, `repositories/`, `utils/`, `types/`
- `src/components/` — Componentes globais e UI compartilhada
- `src/hooks/` — Hooks globais (os específicos de feature ficam em cada feature)
- `src/lib/` — Utilitários, cálculos e helpers globais
- `src/domain/` e `src/infrastructure/` — (LEGADO) agora migrados para features

### Configurações

- `vite.config.ts` e `eslint.config.js` permanecem na raiz para máxima compatibilidade
- Outros arquivos de configuração podem ser centralizados em `.config/`

### Imports Absolutos

- Usar `@/` para importar a partir de `src/` (ex: `@/features/planning/components/calculator/Calculator`)

### Testes

- Testes devem ser colocados ao lado dos arquivos implementados (colocated tests)

### Recomendações

- Novos domínios devem ser criados como features
- Refatorações futuras devem seguir este padrão

## Lint de CSS/Tailwind (Stylelint)

- O stylelint é configurado para rodar **apenas nos arquivos fonte** (ex: src/styles, src/components, etc).
- Arquivos de build/minificados (ex: dist/, build/) são **ignorados** pelo lint, conforme melhores práticas para projetos Tailwind.
- Erros de lint em dist/ não são relevantes, pois esses arquivos são gerados automaticamente e podem conter duplicatas, ordem "errada" de seletores, etc.
- O objetivo do lint é garantir qualidade e padrão no CSS escrito manualmente.
- Se rodar `npm run lint:style`, o resultado reflete apenas o CSS fonte.

---
