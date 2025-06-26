// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Declare Deno global to resolve TypeScript errors
declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

// Force re-deploy
console.log("Hello from Functions!")

Deno.serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok')
  }

  try {
  // Recebe o payload do trigger (dados do lead)
  const { record } = await req.json()

  // Dados do lead
    const { name, email, phone, wants_expert_evaluation, patrimonio_range, simulation_url } = record

  // Envio via SendGrid
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
  const SENDGRID_FROM = Deno.env.get('SENDGRID_FROM') // ex: seu@email.com
  const SENDGRID_TO = Deno.env.get('SENDGRID_TO')     // ex: robertoecf@gmail.com

  if (!SENDGRID_API_KEY || !SENDGRID_FROM || !SENDGRID_TO) {
      console.error('Environment variables not set')
    return new Response('Variáveis de ambiente não configuradas', { status: 500 })
  }

    // Monta o corpo do email HTML para o admin - Design System Tecno-Etéreo
    const adminMessageHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Lead - Futuro em Foco</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #000000;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
        <!-- Matrix-style pattern overlay -->
        <div style="background-image: linear-gradient(0deg, rgba(228, 130, 0, 0.03) 50%, transparent 50%), linear-gradient(90deg, rgba(228, 130, 0, 0.03) 50%, transparent 50%); background-size: 20px 20px; position: absolute; width: 100%; height: 100%; pointer-events: none;"></div>
        
        <!-- Header com gradiente aurora -->
        <div style="background: linear-gradient(135deg, #E48200 0%, #0F2A3C 50%, #2F3B29 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4);"></div>
            <h1 style="margin: 0; color: #FEFFFB; font-size: 32px; font-weight: 600; position: relative; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                <span style="color: #00ff00; font-family: 'Courier New', monospace; font-size: 14px; display: block; margin-bottom: 10px; opacity: 0.8;">[SISTEMA ATIVO]</span>
                NOVO LEAD DETECTADO
            </h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; background-color: #000000; border: 1px solid rgba(228, 130, 0, 0.2);">
            <div style="background: linear-gradient(135deg, rgba(228, 130, 0, 0.05), rgba(15, 42, 60, 0.02)); padding: 25px; border-radius: 8px; border: 1px solid rgba(228, 130, 0, 0.15);">
                <h2 style="color: #E48200; margin: 0 0 20px 0; font-size: 18px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                    DADOS DO LEAD:
                </h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;">Nome:</td>
                        <td style="padding: 12px 0; color: #FEFFFB; font-size: 16px;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;">Email:</td>
                        <td style="padding: 12px 0;">
                            <a href="mailto:${email}" style="color: #E48200; text-decoration: none; font-size: 16px;">${email}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;">Telefone:</td>
                        <td style="padding: 12px 0; color: #FEFFFB; font-size: 16px;">${phone || '---'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;">Especialista:</td>
                        <td style="padding: 12px 0;">
                            <span style="display: inline-block; background: ${wants_expert_evaluation ? 'rgba(0, 255, 0, 0.2)' : 'rgba(228, 130, 0, 0.2)'}; color: ${wants_expert_evaluation ? '#00ff00' : '#E48200'}; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-family: 'Courier New', monospace; border: 1px solid ${wants_expert_evaluation ? 'rgba(0, 255, 0, 0.4)' : 'rgba(228, 130, 0, 0.4)'};">
                                ${wants_expert_evaluation ? '[SOLICITADO]' : '[NÃO SOLICITADO]'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;">Patrimônio:</td>
                        <td style="padding: 12px 0; color: #FEFFFB; font-size: 16px;">${patrimonio_range || '---'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;">Simulação:</td>
                        <td style="padding: 12px 0;">
                            ${simulation_url ? `<a href="${simulation_url}" style="color: #E48200; text-decoration: none; font-size: 14px; font-family: 'Courier New', monospace;">[ACESSAR_DADOS]</a>` : '<span style="color: rgba(254, 255, 251, 0.3); font-size: 14px;">---</span>'}
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- Alert Box -->
            <div style="margin-top: 30px; padding: 20px; background: rgba(228, 130, 0, 0.1); border: 1px solid rgba(228, 130, 0, 0.3); border-radius: 4px;">
                <p style="margin: 0; color: #E48200; font-size: 12px; font-family: 'Courier New', monospace; text-transform: uppercase;">
                    <span style="color: #00ff00;">[!]</span> AÇÃO REQUERIDA: CONTATAR LEAD EM ATÉ 24H PARA MAXIMIZAR CONVERSÃO
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="padding: 20px 30px; text-align: center; border-top: 1px solid rgba(228, 130, 0, 0.1);">
            <p style="margin: 0; color: rgba(254, 255, 251, 0.3); font-size: 11px; font-family: 'Courier New', monospace;">
                FUTURO EM FOCO © 2024 | SISTEMA DE GESTÃO DE LEADS v2.0
            </p>
        </div>
    </div>
</body>
</html>
    `

    const adminEmail = {
      personalizations: [{ to: [{ email: SENDGRID_TO }] }],
      from: { email: SENDGRID_FROM, name: 'Futuro em Foco - Sistema' },
      subject: `[LEAD] ${name} - ${wants_expert_evaluation ? 'QUER ESPECIALISTA' : 'AUTOATENDIMENTO'}`,
      content: [
        { type: 'text/plain', value: `Novo lead: ${name} - ${email}` }, // Plain text first
        { type: 'text/html', value: adminMessageHTML }
      ]
    };

    const sendAdminEmail = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
      body: JSON.stringify(adminEmail)
    });

    if (!sendAdminEmail.ok) {
        console.error("Falha ao enviar email para o admin:", await sendAdminEmail.text());
        // Decide whether to stop if admin email fails. For now, we'll continue.
    }

    // Enviar email para o usuário com o link da simulação
    if (email && simulation_url) {
      const userMessageHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sua Simulação - Futuro em Foco</title>
  <style>
    /* Design System Tecno-Etéreo */
    :root {
      --palette-blue-deep: #0F2A3C;
      --palette-green-dark: #2F3B29;
      --palette-mix-orange: #E48200;
      --palette-red-vivid: #FF0000;
      --palette-black: #000000;
      --palette-mix-white: #FEFFFB;

      --theme-surface: var(--palette-black);
      --theme-surface-container-bg: rgba(15, 42, 60, 0.25);
      --theme-primary: var(--palette-mix-orange);
      --theme-on-primary: var(--palette-mix-white);
      --theme-on-surface: var(--palette-mix-white);

      --font-primary: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      --transition-standard: 0.3s ease-in-out;
    }

    /* Global Styles */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-primary);
      background: var(--theme-surface);
      color: var(--theme-on-surface);
      overflow-x: hidden;
    }
    a { text-decoration: none; }

    /* Aurora Background */
    .aurora-overlay {
      position: absolute;
      top: -50%; left: -50%;
      width: 200%; height: 200%;
      background:
        radial-gradient(circle at 20% 50%, rgba(228,130,0,0.15) 0%, transparent 50%) mix-blend-mode: screen,
        radial-gradient(circle at 80% 50%, rgba(15,42,60,0.15) 0%, transparent 50%) mix-blend-mode: screen,
        radial-gradient(circle at 50% 50%, rgba(47,59,41,0.15) 0%, transparent 50%) mix-blend-mode: screen;
      filter: blur(100px) saturate(1.5);
      animation: aurora 20s var(--transition-standard) infinite;
      z-index: 0;
    }
    @keyframes aurora { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(10%,10%) scale(1.05); } }

    /* Containers & Panels */
    .container { max-width: 600px; margin: 0 auto; position: relative; }
    .panel {
      backdrop-filter: blur(40px);
      background-color: var(--theme-surface-container-bg);
      border: 1px solid rgba(228,130,0,0.1);
      border-radius: 8px;
    }
    .panel.features {
      width: fit-content;
      margin: 20px auto;
      padding: 20px 30px;
      border-radius: 16px;
      background-color: rgba(15, 42, 60, 0.2);
    }
    .panel.message {
      width: calc(100% + 80px);
      margin: 40px -40px;
      padding: 30px;
      background-color: transparent;
      border: 1px solid rgba(228,130,0,0.15);
      border-radius: 8px;
    }

    /* Header */
    header {
      position: relative;
      padding: 60px 30px;
      text-align: center;
      overflow: hidden;
      background: var(--theme-surface);
      border-bottom: 3px solid transparent;
      border-image: linear-gradient(
        to right,
        var(--palette-green-dark) 0%,
        var(--palette-green-dark) 20%,
        var(--palette-blue-deep) 40%,
        var(--palette-green-dark) 60%,
        var(--palette-mix-orange) 80%,
        var(--palette-red-vivid) 100%
      ) 1;
    }
    header h1 {
      color: var(--palette-mix-white);
      font-size: 40px;
      font-weight: 300;
      letter-spacing: 2px;
      text-transform: lowercase;
      position: relative;
      z-index: 1;
    }
    header p {
      margin-top: 10px;
      font-size: 14px;
      letter-spacing: 3px;
      font-family: var(--font-mono);
      color: var(--palette-mix-white);
      position: relative;
      z-index: 1;
      border: none;
    }

    /* Main Content */
    .content { display: flex; flex-direction: column; align-items: center; padding: 50px 40px; }
    .greeting h2 { color: var(--palette-mix-white); font-size: 28px; font-weight: 400; }

    /* Message Panel */
    .message { margin: 40px 0; padding: 30px; background: linear-gradient(135deg, rgba(228,130,0,0.05), rgba(15,42,60,0.02)); border-radius: 8px; border: 1px solid rgba(228,130,0,0.15); }
    .message p { line-height: 1.8; margin-bottom: 20px; }
    .message strong { color: var(--theme-primary); }

    /* CTA Button */
    .cta a {
      display: inline-block;
      padding: 16px 48px;
      font-family: var(--font-primary);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 400;
      transition: transform var(--transition-standard), background-color var(--transition-standard);
      background-color: rgba(228,130,0,0.2);
      color: var(--theme-on-primary);
      border: none;
      border-radius: 999px;
    }
    .cta a:hover { transform: scale(1.05); background-color: transparent; color: var(--theme-primary); }

    /* Features List */
    .features h3 { font-family: var(--font-mono); font-size: 14px; text-transform: uppercase; color: var(--theme-primary); margin-bottom: 20px; }
    .features div { line-height: 2; font-size: 14px; }
    .features span { font-family: var(--font-mono); color: #00ff00; margin-right: 8px; }

    /* Security Note */
    .security { margin-top: 30px; padding: 15px; background: rgba(0,255,0,0.05); border: 1px solid rgba(0,255,0,0.2); border-radius: 4px; font-size: 12px; font-family: var(--font-mono); }
    .security span { color: #00ff00; }

    /* Footer */
    footer { padding: 30px; text-align: center; border-top: 1px solid rgba(228,130,0,0.1); background: rgba(0,0,0,0.5); font-family: var(--font-mono); }
    footer p:first-child { margin-bottom: 10px; }
    footer p:nth-child(1) { font-size: 16px; color: var(--palette-mix-white); }
    footer p:nth-child(2) a { color: var(--theme-primary); }
    footer p:nth-child(3) { text-transform: lowercase; color: var(--palette-mix-white); font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="aurora-overlay"></div>
      <h1>futuro em foco</h1>
      <p>Gestão Patrimonial</p>
    </header>

    <div class="content">
      <div class="greeting"><h2>Olá, \${name}</h2></div>
      <div class="panel message">
        <p>Sua simulação de <strong>independência financeira</strong> foi processada com sucesso. Nossa inteligência analisou seus dados e preparou projeções personalizadas para seu perfil.</p>
        <p>Os resultados incluem múltiplos cenários econômicos e estratégias otimizadas para maximizar suas chances de sucesso.</p>
      </div>
      <div class="cta"><a href="\${simulation_url}">ACESSAR SIMULAÇÃO</a></div>
      <div class="panel features">
        <h3>[RECURSOS_DISPONÍVEIS]</h3>
        <div><span>[✓]</span>Projeção patrimonial em tempo real</div>
        <div><span>[✓]</span>Análise estatística com 1001 simulações</div>
        <div><span>[✓]</span>Cenários otimista, realista e pessimista</div>
        <div><span>[✓]</span>Recomendações personalizadas por IA</div>
      </div>
      <div class="security"><p><span>[SEGURANÇA]</span> Este link é único e pessoal. Seus dados estão criptografados e protegidos.</p></div>
    </div>

    <footer>
      <p>Dúvidas?</p>
      <p><a href="mailto:\${SENDGRID_FROM}">[CONTATAR_FUNDADOR]</a></p>
      <p>futuro em foco © 2024 | v2.0.0 | build 20240115</p>
    </footer>
  </div>
</body>
</html>
      `
      
      const userEmail = {
        personalizations: [{ to: [{ email: email }] }],
        from: { email: SENDGRID_FROM, name: 'Futuro em Foco' },
        subject: '[FUTURO EM FOCO] Simulação Processada - Acesso Liberado',
        content: [
          { type: 'text/plain', value: `Olá ${name}, sua simulação está pronta! Acesse: ${simulation_url}` }, // Plain text first
          { type: 'text/html', value: userMessageHTML }
        ]
      };
      
      const sendUserEmail = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userEmail)
      });

      if (!sendUserEmail.ok) {
        console.error("Falha ao enviar email para o usuário:", await sendUserEmail.text());
        return new Response('Erro ao enviar email para o usuário', { status: 500 })
      }
    }

    return new Response('Processamento de email concluído', { status: 200 })
  } catch(err) {
    console.error('Function error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-lead-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

// Deploy trigger: Thu Jun 26 13:30:41 -03 2025
