// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

console.log("Hello from Functions!")

serve(async (req) => {
  // Recebe o payload do trigger (dados do lead)
  const { record } = await req.json()

  // Dados do lead
  const { name, email, phone, wants_expert_evaluation, patrimonio_range } = record

  // Monta o corpo do email
  const message = `
Novo lead recebido:
Nome: ${name}
Email: ${email}
Telefone: ${phone || '-'}
Quer especialista: ${wants_expert_evaluation ? 'Sim' : 'Não'}
Faixa de patrimônio: ${patrimonio_range || '-'}
  `

  // Envio via SendGrid
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
  const SENDGRID_FROM = Deno.env.get('SENDGRID_FROM') // ex: seu@email.com
  const SENDGRID_TO = Deno.env.get('SENDGRID_TO')     // ex: robertoecf@gmail.com

  if (!SENDGRID_API_KEY || !SENDGRID_FROM || !SENDGRID_TO) {
    return new Response('Variáveis de ambiente não configuradas', { status: 500 })
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: SENDGRID_TO }] }],
      from: { email: SENDGRID_FROM },
      subject: 'Novo lead recebido',
      content: [{ type: 'text/plain', value: message }]
    })
  })

  if (!res.ok) {
    return new Response('Erro ao enviar email', { status: 500 })
  }

  return new Response('Email enviado com sucesso', { status: 200 })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-lead-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
