# Vivian Shop - Boutique E-commerce Proposal

Este repositório contém a proposta comercial e o protótipo técnico para a transição das lojas da Vivian (Papelaria Personalizada e Atividades Adaptadas) do Elo7 para uma plataforma própria de luxo.

## 🚀 Funcionalidades Principais

- **Proposta Comercial Premium**: Uma página de apresentação de alto impacto com design unificado (Lilás & Pearl).
- **Loja Demo**: Protótipo da experiência do cliente final, com foco em simplicidade e conversão.
- **Painel Administrativo Inteligente**:
  - **Chat Interno**: Sistema de mensagens próprio para substituir o WhatsApp e centralizar o atendimento.
  - **Logística Integrada**: Geração de etiquetas de envio e declaração de conteúdo em poucos cliques.
  - **Marketing com IA**: Sugestões de posts e automação para Instagram.
  - **Autoatendimento com IA**: Opção de chatbot inteligente para suporte 24h.

## 🎨 Design System

- **Cores**: Lilás (#9B89B3), Pearl (#FAF9F6), Mint (#B8E2D4).
- **UI**: Cards com bordas sólidas de 2px, sombras suaves e cantos arredondados de 32px.
- **Tom de Voz**: Consultoria individualizada, foco em autonomia e valorização da marca.

## 🛠️ Tecnologias

- React.js
- Vite
- Bootstrap (Customizado)
- Framer Motion (Animações)
- Lucide React (Ícones)
- ECharts (Dashboard)

## 📦 Como rodar o projeto

1. Clone o repositório
2. `npm install`
3. `npm run dev`

## Estrutura

```
loja/src/          a loja em Next.js
  app/             rotas e layouts (vitrine em (loja), painel da dona em admin)
  telas/           telas da vitrine e do painel
  componentes/     peças de interface reaproveitadas
  dominio/         regras de negócio (pedido, pagamento, avaliação)
  dados/           acesso ao catálogo, pedidos e conversas (banco e memória)
  servicos/        integrações externas
loja/public/       fotos e ícones da loja
supabase/          migracoes/ (SQL do banco) e funcoes/ (Edge Functions)
scripts/           publicação, importação do catálogo e conferências automáticas
docs/              guias e decisões do projeto, em linguagem para a dona da loja
.github/workflows/ CI: testes, conferências e publicação
public/            imagens da página de proposta
```

---
Desenvolvido por **Maycon Bruno** - Soluções Autônomas para Empreendedores.
