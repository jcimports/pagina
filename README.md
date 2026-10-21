# JC Imports — site institucional (v2 premium)

Site estático (HTML/CSS/JS, sem build) da JC Imports, revenda de iPhones em Manaus (@jc.imports_iphones).

## Estrutura
- `index.html` — hero, faixa de modelos, compromisso, bento (lacrados, seminovos, 21x, troca, Pix, Instagram), checklist, troca, loja, CTA final
- `styles.css` — preto profundo + dourado do logo, SF Pro/Inter + Cormorant itálico nos destaques
- `main.js` — animações (GSAP + ScrollTrigger), rolagem suave (Lenis), formulário de troca → WhatsApp
- `vendor/` — GSAP 3.12.5, ScrollTrigger e Lenis 1.1.13 hospedados localmente (sem depender de CDN)
- `assets/` — imagens dos iPhones (.webp otimizado + .png de fallback)
- `config.js` — **editar aqui**: WhatsApp e listas de modelos

Sem JavaScript ou com "reduzir movimento" ativo, todo o conteúdo aparece estático.

## Deploy
`vercel --prod` dentro desta pasta (projeto já vinculado em `.vercel/`).
