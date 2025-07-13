"use strict";
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// Setup type definitions for built-in Supabase Runtime APIs
require("jsr:@supabase/functions-js/edge-runtime.d.ts");
// Force re-deploy
console.log('Hello from Functions!');
Deno.serve(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var record, name_1, email, phone, wants_expert_evaluation, patrimonio_range, simulation_url, SENDGRID_API_KEY, SENDGRID_FROM, SENDGRID_TO, adminMessageHTML, adminEmail, sendAdminEmail, _a, _b, _c, userMessageHTML, userEmail, sendUserEmail, _d, _e, _f, err_1;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                // This is needed if you're planning to invoke your function from a browser.
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok')];
                }
                _g.label = 1;
            case 1:
                _g.trys.push([1, 9, , 10]);
                return [4 /*yield*/, req.json()];
            case 2:
                record = (_g.sent()).record;
                name_1 = record.name, email = record.email, phone = record.phone, wants_expert_evaluation = record.wants_expert_evaluation, patrimonio_range = record.patrimonio_range, simulation_url = record.simulation_url;
                SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
                SENDGRID_FROM = Deno.env.get('SENDGRID_FROM');
                SENDGRID_TO = Deno.env.get('SENDGRID_TO');
                if (!SENDGRID_API_KEY || !SENDGRID_FROM || !SENDGRID_TO) {
                    console.error('Environment variables not set');
                    return [2 /*return*/, new Response('Variáveis de ambiente não configuradas', { status: 500 })];
                }
                adminMessageHTML = "\n<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Novo Lead - Futuro em Foco</title>\n</head>\n<body style=\"margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #000000;\">\n    <div style=\"max-width: 600px; margin: 0 auto; background-color: #000000;\">\n        <!-- Matrix-style pattern overlay -->\n        <div style=\"background-image: linear-gradient(0deg, rgba(228, 130, 0, 0.03) 50%, transparent 50%), linear-gradient(90deg, rgba(228, 130, 0, 0.03) 50%, transparent 50%); background-size: 20px 20px; position: absolute; width: 100%; height: 100%; pointer-events: none;\"></div>\n        \n        <!-- Header com gradiente aurora -->\n        <div style=\"background: linear-gradient(135deg, #E48200 0%, #0F2A3C 50%, #2F3B29 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;\">\n            <div style=\"position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4);\"></div>\n            <h1 style=\"margin: 0; color: #FEFFFB; font-size: 32px; font-weight: 600; position: relative; text-shadow: 0 2px 4px rgba(0,0,0,0.3);\">\n                <span style=\"color: #00ff00; font-family: 'Courier New', monospace; font-size: 14px; display: block; margin-bottom: 10px; opacity: 0.8;\">[SISTEMA ATIVO]</span>\n                NOVO LEAD DETECTADO\n            </h1>\n        </div>\n        \n        <!-- Content -->\n        <div style=\"padding: 40px 30px; background-color: #000000; border: 1px solid rgba(228, 130, 0, 0.2);\">\n            <div style=\"background: linear-gradient(135deg, rgba(228, 130, 0, 0.05), rgba(15, 42, 60, 0.02)); padding: 25px; border-radius: 8px; border: 1px solid rgba(228, 130, 0, 0.15);\">\n                <h2 style=\"color: #E48200; margin: 0 0 20px 0; font-size: 18px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;\">\n                    DADOS DO LEAD:\n                </h2>\n                \n                <table style=\"width: 100%; border-collapse: collapse;\">\n                    <tr>\n                        <td style=\"padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;\">Nome:</td>\n                        <td style=\"padding: 12px 0; color: #FEFFFB; font-size: 16px;\">".concat(name_1, "</td>\n                    </tr>\n                    <tr>\n                        <td style=\"padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;\">Email:</td>\n                        <td style=\"padding: 12px 0;\">\n                            <a href=\"mailto:").concat(email, "\" style=\"color: #E48200; text-decoration: none; font-size: 16px;\">").concat(email, "</a>\n                        </td>\n                    </tr>\n                    <tr>\n                        <td style=\"padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;\">Telefone:</td>\n                        <td style=\"padding: 12px 0; color: #FEFFFB; font-size: 16px;\">").concat(phone || '---', "</td>\n                    </tr>\n                    <tr>\n                        <td style=\"padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;\">Especialista:</td>\n                        <td style=\"padding: 12px 0;\">\n                            <span style=\"display: inline-block; background: ").concat(wants_expert_evaluation ? 'rgba(0, 255, 0, 0.2)' : 'rgba(228, 130, 0, 0.2)', "; color: ").concat(wants_expert_evaluation ? '#00ff00' : '#E48200', "; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-family: 'Courier New', monospace; border: 1px solid ").concat(wants_expert_evaluation ? 'rgba(0, 255, 0, 0.4)' : 'rgba(228, 130, 0, 0.4)', ";\">\n                                ").concat(wants_expert_evaluation ? '[SOLICITADO]' : '[NÃO SOLICITADO]', "\n                            </span>\n                        </td>\n                    </tr>\n                    <tr>\n                        <td style=\"padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;\">Patrim\u00F4nio:</td>\n                        <td style=\"padding: 12px 0; color: #FEFFFB; font-size: 16px;\">").concat(patrimonio_range || '---', "</td>\n                    </tr>\n                    <tr>\n                        <td style=\"padding: 12px 0; color: rgba(254, 255, 251, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;\">Simula\u00E7\u00E3o:</td>\n                        <td style=\"padding: 12px 0;\">\n                            ").concat(simulation_url ? "<a href=\"".concat(simulation_url, "\" style=\"color: #E48200; text-decoration: none; font-size: 14px; font-family: 'Courier New', monospace;\">[ACESSAR_DADOS]</a>") : '<span style="color: rgba(254, 255, 251, 0.3); font-size: 14px;">---</span>', "\n                        </td>\n                    </tr>\n                </table>\n            </div>\n            \n            <!-- Alert Box -->\n            <div style=\"margin-top: 30px; padding: 20px; background: rgba(228, 130, 0, 0.1); border: 1px solid rgba(228, 130, 0, 0.3); border-radius: 4px;\">\n                <p style=\"margin: 0; color: #E48200; font-size: 12px; font-family: 'Courier New', monospace; text-transform: uppercase;\">\n                    <span style=\"color: #00ff00;\">[!]</span> A\u00C7\u00C3O REQUERIDA: CONTATAR LEAD EM AT\u00C9 24H PARA MAXIMIZAR CONVERS\u00C3O\n                </p>\n            </div>\n        </div>\n        \n        <!-- Footer -->\n        <div style=\"padding: 20px 30px; text-align: center; border-top: 1px solid rgba(228, 130, 0, 0.1);\">\n            <p style=\"margin: 0; color: rgba(254, 255, 251, 0.3); font-size: 11px; font-family: 'Courier New', monospace;\">\n                FUTURO EM FOCO \u00A9 2024 | SISTEMA DE GEST\u00C3O DE LEADS v2.0\n            </p>\n        </div>\n    </div>\n</body>\n</html>\n    ");
                adminEmail = {
                    personalizations: [{ to: [{ email: SENDGRID_TO }] }],
                    from: { email: SENDGRID_FROM, name: 'Futuro em Foco - Sistema' },
                    subject: "[LEAD] ".concat(name_1, " - ").concat(wants_expert_evaluation ? 'QUER ESPECIALISTA' : 'AUTOATENDIMENTO'),
                    content: [
                        { type: 'text/plain', value: "Novo lead: ".concat(name_1, " - ").concat(email) }, // Plain text first
                        { type: 'text/html', value: adminMessageHTML },
                    ],
                };
                return [4 /*yield*/, fetch('https://api.sendgrid.com/v3/mail/send', {
                        method: 'POST',
                        headers: {
                            Authorization: "Bearer ".concat(SENDGRID_API_KEY),
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(adminEmail),
                    })];
            case 3:
                sendAdminEmail = _g.sent();
                if (!!sendAdminEmail.ok) return [3 /*break*/, 5];
                _b = (_a = console).error;
                _c = ['Falha ao enviar email para o admin:'];
                return [4 /*yield*/, sendAdminEmail.text()];
            case 4:
                _b.apply(_a, _c.concat([_g.sent()]));
                _g.label = 5;
            case 5:
                if (!(email && simulation_url)) return [3 /*break*/, 8];
                userMessageHTML = "\n<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Sua Simula\u00E7\u00E3o - Futuro em Foco</title>\n  <style>\n    /* Design System Tecno-Et\u00E9reo */\n    :root {\n      --palette-blue-deep: #0F2A3C;\n      --palette-green-dark: #2F3B29;\n      --palette-mix-orange: #E48200;\n      --palette-red-vivid: #FF0000;\n      --palette-black: #000000;\n      --palette-mix-white: #FEFFFB;\n\n      --theme-surface: var(--palette-black);\n      --theme-surface-container-bg: rgba(15, 42, 60, 0.25);\n      --theme-primary: var(--palette-mix-orange);\n      --theme-on-primary: var(--palette-mix-white);\n      --theme-on-surface: var(--palette-mix-white);\n\n      --font-primary: 'Inter', sans-serif;\n      --font-mono: 'JetBrains Mono', monospace;\n\n      --transition-standard: 0.3s ease-in-out;\n    }\n\n    /* Global Styles */\n    * { box-sizing: border-box; margin: 0; padding: 0; }\n    body {\n      font-family: var(--font-primary);\n      background: var(--theme-surface);\n      color: var(--theme-on-surface);\n      overflow-x: hidden;\n    }\n    a { text-decoration: none; }\n\n    /* Aurora Background */\n    .aurora-overlay {\n      position: absolute;\n      top: -50%; left: -50%;\n      width: 200%; height: 200%;\n      background:\n        radial-gradient(circle at 20% 50%, rgba(228,130,0,0.15) 0%, transparent 50%) mix-blend-mode: screen,\n        radial-gradient(circle at 80% 50%, rgba(15,42,60,0.15) 0%, transparent 50%) mix-blend-mode: screen,\n        radial-gradient(circle at 50% 50%, rgba(47,59,41,0.15) 0%, transparent 50%) mix-blend-mode: screen;\n      filter: blur(100px) saturate(1.5);\n      animation: aurora 20s var(--transition-standard) infinite;\n      z-index: 0;\n    }\n    @keyframes aurora { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(10%,10%) scale(1.05); } }\n\n    /* Containers & Panels */\n    .container { max-width: 600px; margin: 0 auto; position: relative; }\n    .panel {\n      backdrop-filter: blur(40px);\n      background-color: var(--theme-surface-container-bg);\n      border: 1px solid rgba(228,130,0,0.1);\n      border-radius: 8px;\n    }\n    .panel.features {\n      width: fit-content;\n      margin: 20px auto;\n      padding: 20px 30px;\n      border-radius: 16px;\n      background-color: rgba(15, 42, 60, 0.2);\n    }\n    .panel.message {\n      width: calc(100% + 80px);\n      margin: 40px -40px;\n      padding: 30px;\n      background-color: transparent;\n      border: 1px solid rgba(228,130,0,0.15);\n      border-radius: 8px;\n    }\n\n    /* Header */\n    header {\n      position: relative;\n      padding: 60px 30px;\n      text-align: center;\n      overflow: hidden;\n      background: var(--theme-surface);\n      border-bottom: 3px solid transparent;\n      border-image: linear-gradient(\n        to right,\n        var(--palette-green-dark) 0%,\n        var(--palette-green-dark) 20%,\n        var(--palette-blue-deep) 40%,\n        var(--palette-green-dark) 60%,\n        var(--palette-mix-orange) 80%,\n        var(--palette-red-vivid) 100%\n      ) 1;\n    }\n    header h1 {\n      color: var(--palette-mix-white);\n      font-size: 40px;\n      font-weight: 300;\n      letter-spacing: 2px;\n      text-transform: lowercase;\n      position: relative;\n      z-index: 1;\n    }\n    header p {\n      margin-top: 10px;\n      font-size: 14px;\n      letter-spacing: 3px;\n      font-family: var(--font-mono);\n      color: var(--palette-mix-white);\n      position: relative;\n      z-index: 1;\n      border: none;\n    }\n\n    /* Main Content */\n    .content { display: flex; flex-direction: column; align-items: center; padding: 50px 40px; }\n    .greeting h2 { color: var(--palette-mix-white); font-size: 28px; font-weight: 400; }\n\n    /* Message Panel */\n    .message { margin: 40px 0; padding: 30px; background: linear-gradient(135deg, rgba(228,130,0,0.05), rgba(15,42,60,0.02)); border-radius: 8px; border: 1px solid rgba(228,130,0,0.15); }\n    .message p { line-height: 1.8; margin-bottom: 20px; }\n    .message strong { color: var(--theme-primary); }\n\n    /* CTA Button */\n    .cta a {\n      display: inline-block;\n      padding: 16px 48px;\n      font-family: var(--font-primary);\n      font-size: 14px;\n      text-transform: uppercase;\n      letter-spacing: 2px;\n      font-weight: 400;\n      transition: transform var(--transition-standard), background-color var(--transition-standard);\n      background-color: rgba(228,130,0,0.2);\n      color: var(--theme-on-primary);\n      border: none;\n      border-radius: 999px;\n    }\n    .cta a:hover { transform: scale(1.05); background-color: transparent; color: var(--theme-primary); }\n\n    /* Features List */\n    .features h3 { font-family: var(--font-mono); font-size: 14px; text-transform: uppercase; color: var(--theme-primary); margin-bottom: 20px; }\n    .features div { line-height: 2; font-size: 14px; }\n    .features span { font-family: var(--font-mono); color: #00ff00; margin-right: 8px; }\n\n    /* Security Note */\n    .security { margin-top: 30px; padding: 15px; background: rgba(0,255,0,0.05); border: 1px solid rgba(0,255,0,0.2); border-radius: 4px; font-size: 12px; font-family: var(--font-mono); }\n    .security span { color: #00ff00; }\n\n    /* Footer */\n    footer { padding: 30px; text-align: center; border-top: 1px solid rgba(228,130,0,0.1); background: rgba(0,0,0,0.5); font-family: var(--font-mono); }\n    footer p:first-child { margin-bottom: 10px; }\n    footer p:nth-child(1) { font-size: 16px; color: var(--palette-mix-white); }\n    footer p:nth-child(2) a { color: var(--theme-primary); }\n    footer p:nth-child(3) { text-transform: lowercase; color: var(--palette-mix-white); font-size: 14px; }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <header>\n      <div class=\"aurora-overlay\"></div>\n      <h1>futuro em foco</h1>\n      <p>Gest\u00E3o Patrimonial</p>\n    </header>\n\n    <div class=\"content\">\n      <div class=\"greeting\"><h2>Ol\u00E1, ${name}</h2></div>\n      <div class=\"panel message\">\n        <p>Sua simula\u00E7\u00E3o de <strong>independ\u00EAncia financeira</strong> foi processada com sucesso. Nossa intelig\u00EAncia analisou seus dados e preparou proje\u00E7\u00F5es personalizadas para seu perfil.</p>\n        <p>Os resultados incluem m\u00FAltiplos cen\u00E1rios econ\u00F4micos e estrat\u00E9gias otimizadas para maximizar suas chances de sucesso.</p>\n      </div>\n      <div class=\"cta\"><a href=\"${simulation_url}\">ACESSAR SIMULA\u00C7\u00C3O</a></div>\n      <div class=\"panel features\">\n        <h3>[RECURSOS_DISPON\u00CDVEIS]</h3>\n        <div><span>[\u2713]</span>Proje\u00E7\u00E3o patrimonial em tempo real</div>\n        <div><span>[\u2713]</span>An\u00E1lise estat\u00EDstica com 1001 simula\u00E7\u00F5es</div>\n        <div><span>[\u2713]</span>Cen\u00E1rios otimista, realista e pessimista</div>\n        <div><span>[\u2713]</span>Recomenda\u00E7\u00F5es personalizadas por IA</div>\n      </div>\n      <div class=\"security\"><p><span>[SEGURAN\u00C7A]</span> Este link \u00E9 \u00FAnico e pessoal. Seus dados est\u00E3o criptografados e protegidos.</p></div>\n    </div>\n\n    <footer>\n      <p>D\u00FAvidas?</p>\n      <p><a href=\"mailto:${SENDGRID_FROM}\">[CONTATAR_FUNDADOR]</a></p>\n      <p>futuro em foco \u00A9 2024 | v2.0.0 | build 20240115</p>\n    </footer>\n  </div>\n</body>\n</html>\n      ";
                userEmail = {
                    personalizations: [{ to: [{ email: email }] }],
                    from: { email: SENDGRID_FROM, name: 'Futuro em Foco' },
                    subject: 'Seu futuro em foco:',
                    content: [
                        {
                            type: 'text/plain',
                            value: "Ol\u00E1 ".concat(name_1, ", sua simula\u00E7\u00E3o est\u00E1 pronta! Acesse: ").concat(simulation_url),
                        }, // Plain text first
                        { type: 'text/html', value: userMessageHTML },
                    ],
                };
                return [4 /*yield*/, fetch('https://api.sendgrid.com/v3/mail/send', {
                        method: 'POST',
                        headers: {
                            Authorization: "Bearer ".concat(SENDGRID_API_KEY),
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userEmail),
                    })];
            case 6:
                sendUserEmail = _g.sent();
                if (!!sendUserEmail.ok) return [3 /*break*/, 8];
                _e = (_d = console).error;
                _f = ['Falha ao enviar email para o usuário:'];
                return [4 /*yield*/, sendUserEmail.text()];
            case 7:
                _e.apply(_d, _f.concat([_g.sent()]));
                return [2 /*return*/, new Response('Erro ao enviar email para o usuário', { status: 500 })];
            case 8: return [2 /*return*/, new Response('Processamento de email concluído', { status: 200 })];
            case 9:
                err_1 = _g.sent();
                console.error('Function error:', err_1);
                return [2 /*return*/, new Response('Internal Server Error', { status: 500 })];
            case 10: return [2 /*return*/];
        }
    });
}); });
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-lead-email' \
    --header 'Authorization: Bearer <SUPABASE_ANON_KEY>' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
// Deploy trigger: Thu Jun 26 13:30:41 -03 2025
