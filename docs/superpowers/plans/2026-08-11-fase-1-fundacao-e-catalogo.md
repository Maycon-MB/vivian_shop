# Fase 1 — Fundação e catálogo

> **Para quem for executar:** use a skill `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para implementar tarefa a tarefa. Os passos usam `- [ ]` para marcar progresso.

**Objetivo:** ter a loja real rodando com o catálogo vindo do banco, filtro por linha e página de produto, sobre uma base testada onde as regras de venda são código verificado e não texto solto.

**Arquitetura:** Next.js 16 com App Router, TypeScript e Tailwind, servindo páginas estáticas com revalidação. Supabase Postgres guarda o catálogo; as regras de venda ficam num módulo puro (`src/dominio/`) sem dependência de React ou banco, para poderem ser testadas em milissegundos e reaproveitadas no painel. Os componentes leem esse módulo — nunca reimplementam regra.

**Stack:** Next.js 16.3, React 19.2, TypeScript, Tailwind CSS 4, Supabase (Postgres + CLI), Vitest 4.

## Situação

Tarefas 1, 3 e 5 executadas em 11/08/2026, junto com o `moeda` e o `CardProduto` da tarefa 6 — nenhuma delas depende de credencial.

Falta o que precisa do Supabase: tarefa 2 (schema), tarefa 4 (leitura) e o restante da tarefa 6 (páginas). O primeiro passo para retomar é criar o projeto no Supabase e preencher `loja/.env.local`.

Estado: 33 testes passando, lint limpo, build gerando páginas estáticas.

## Restrições globais

Valem para toda tarefa deste plano e dos próximos.

- **Node 22.17** ou superior. Confirmado no ambiente.
- **Nada que identifique a cliente entra no repositório.** O repositório é público. CEP, endereço, telefone e chaves ficam em `.env.local`, que o `.gitignore` já cobre. Ver `.env.example`.
- **Paleta e tipografia** vêm de `docs/superpowers/specs/2026-08-10-identidade-visual-design.md`: `paper #FBFAF7`, `ink #12305B`, `rule #A8C6E8`, `chalk #2E9B96` (linha personalizada), `marker #FFD400` (linha pedagógica), `heart #C4436B`. Fontes: Fraunces em títulos, Atkinson Hyperlegible em texto e interface.
- **Amarelo `#FFD400` nunca é cor de texto.** Só preenchimento, com `ink` por cima. Contraste de amarelo sobre branco é 1.3:1.
- **Regras de venda**, de `docs/superpowers/specs/2026-08-11-arquitetura-mvp-design.md`: mínimo de 10 unidades **por produto** na linha personalizada; 5 dias úteis de produção; linha pedagógica é digital, sem mínimo e sem frete; **uma compra é de uma linha só**, nunca mistura.
- **Português do Brasil** em tudo que a cliente ou o comprador leem. Sem jargão técnico na interface.
- **Nomes de domínio em português** no código (`produto`, `linha`, `minimo`), porque é a linguagem do negócio e evita tradução mental. Nomes de framework ficam como o framework manda.
- **Todo commit roda os testes antes.** `npm test` precisa passar.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `loja/src/dominio/linhas.ts` | As duas linhas e o que cada uma permite. Sem React, sem banco |
| `loja/src/dominio/carrinho.ts` | Regras do carrinho: mínimo, mistura, totais. Sem React, sem banco |
| `loja/src/dominio/produto.ts` | O tipo `Produto` e conversão do formato do banco |
| `loja/src/dados/produtos.ts` | Leitura do catálogo no Supabase. Único lugar que fala com o banco |
| `loja/src/app/page.tsx` | Catálogo com filtro por linha |
| `loja/src/app/produto/[slug]/page.tsx` | Página de um produto |
| `loja/src/componentes/CardProduto.tsx` | Card do catálogo, com a regra de venda visível |
| `loja/src/componentes/SeloLinha.tsx` | Selo colorido que identifica a linha |
| `loja/supabase/migrations/*.sql` | Schema versionado |

O protótipo atual em `src/` fica onde está durante toda a fase 1. Ele é o que a cliente acompanha; só sai do ar quando a loja real tiver catálogo, carrinho e checkout funcionando.

---

## Tarefa 1: Projeto Next com testes rodando — FEITA em 11/08/2026

**Arquivos:**
- Criar: `loja/` (projeto Next completo)
- Criar: `loja/vitest.config.ts`
- Criar: `loja/src/dominio/linhas.ts`
- Criar: `loja/src/dominio/linhas.test.ts`
- Modificar: `.gitignore`

**Interfaces:**
- Consome: nada, é a primeira tarefa
- Produz: `LINHA_PERSONALIZADA`, `LINHA_PEDAGOGICA`, `type Linha`, `ehDigital(linha: Linha): boolean`

- [ ] **Passo 1: Criar o projeto**

Na raiz do repositório:

```bash
npx --yes create-next-app@latest loja --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

O `--yes` evita as perguntas interativas.

- [ ] **Passo 2: Instalar o Vitest**

```bash
cd loja
npm install -D vitest @vitejs/plugin-react
```

- [ ] **Passo 3: Configurar o Vitest**

Criar `loja/vitest.config.mts` — extensão `.mts`, não `.ts`: o `package.json` do Next não declara `type: module`, e o Vite avisa ao carregar sintaxe ESM como CommonJS.

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    // __dirname não existe em módulo ESM.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
```

Em `loja/package.json`, dentro de `"scripts"`, acrescentar:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Passo 4: Escrever o teste que falha**

Criar `loja/src/dominio/linhas.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { LINHA_PERSONALIZADA, LINHA_PEDAGOGICA, ehDigital } from './linhas'

describe('linhas da loja', () => {
  it('a linha pedagógica é digital', () => {
    expect(ehDigital(LINHA_PEDAGOGICA)).toBe(true)
  })

  it('a linha personalizada é física', () => {
    expect(ehDigital(LINHA_PERSONALIZADA)).toBe(false)
  })

  it('os nomes das linhas são os que a cliente usa', () => {
    expect(LINHA_PERSONALIZADA).toBe('Papelaria personalizada')
    expect(LINHA_PEDAGOGICA).toBe('Papelaria pedagógica')
  })
})
```

- [ ] **Passo 5: Rodar e confirmar que falha**

```bash
npm test
```

Esperado: FAIL, `Failed to resolve import "./linhas"`.

- [ ] **Passo 6: Implementar o mínimo**

Criar `loja/src/dominio/linhas.ts`:

```typescript
/**
 * As duas linhas de venda.
 *
 * Os nomes são os que a cliente usa e os que aparecem na loja — não são
 * códigos internos. Mudá-los muda o que o comprador lê.
 */

export const LINHA_PERSONALIZADA = 'Papelaria personalizada'
export const LINHA_PEDAGOGICA = 'Papelaria pedagógica'

export type Linha = typeof LINHA_PERSONALIZADA | typeof LINHA_PEDAGOGICA

export const LINHAS: Linha[] = [LINHA_PERSONALIZADA, LINHA_PEDAGOGICA]

/** Linha pedagógica é arquivo: sem frete, sem produção, sem mínimo. */
export const ehDigital = (linha: Linha): boolean => linha === LINHA_PEDAGOGICA
```

- [ ] **Passo 7: Rodar e confirmar que passa**

```bash
npm test
```

Esperado: PASS, 3 testes.

- [ ] **Passo 8: Ignorar o que não deve subir**

No `.gitignore` da raiz do repositório, acrescentar ao final:

```
loja/node_modules
loja/.next
loja/out
loja/.env.local
```

- [ ] **Passo 9: Commit**

```bash
cd ..
git add .gitignore loja
git commit -m "feat: projeto Next da loja real, com as duas linhas testadas"
```

---

## Tarefa 2: Schema do catálogo no Supabase

**Arquivos:**
- Criar: `loja/supabase/migrations/0001_produtos.sql`
- Criar: `loja/.env.example`
- Modificar: `loja/package.json` (script de migration)

**Interfaces:**
- Consome: `Linha` da Tarefa 1
- Produz: tabela `produtos` com as colunas usadas na Tarefa 4

- [ ] **Passo 1: Criar o projeto no Supabase**

Em [supabase.com](https://supabase.com), criar um projeto novo na região `South America (São Paulo)` — o banco perto de quem compra reduz latência.

Guardar `Project URL` e `anon public key`, que ficam em Project Settings → API.

- [ ] **Passo 2: Registrar as variáveis de ambiente**

Criar `loja/.env.example`:

```
# Copie para .env.local e preencha. .env.local não vai para o repositório.
# Este repositório é público: nada que identifique a cliente entra aqui.

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# CEP de onde saem os envios, usado para cotar frete.
CEP_ORIGEM=
```

Criar `loja/.env.local` com os valores reais do passo 1. Esse arquivo **não** é commitado.

- [ ] **Passo 3: Escrever a migration**

Criar `loja/supabase/migrations/0001_produtos.sql`:

```sql
-- Catálogo da loja.
--
-- minimo e prazo_producao ficam por produto, e não como constante do
-- sistema: hoje valem 10 e 5 para toda a linha personalizada, mas guardar
-- por produto custa duas colunas agora e evita migração no dia em que
-- surgir a lembrancinha com mínimo diferente.
--
-- As medidas são do PACOTE FECHADO de 10 unidades, não da peça solta —
-- é o que a cliente realmente despacha.

create table produtos (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  nome         text not null,
  descricao    text not null default '',
  preco_reais  numeric(10,2) not null check (preco_reais > 0),
  linha        text not null check (linha in ('Papelaria personalizada', 'Papelaria pedagógica')),
  ativo        boolean not null default true,

  minimo          integer not null default 1 check (minimo >= 1),
  prazo_producao  integer not null default 0 check (prazo_producao >= 0),

  -- Só linha personalizada. Medidas do pacote fechado.
  peso_g   integer check (peso_g > 0),
  alt_cm   integer check (alt_cm > 0),
  larg_cm  integer check (larg_cm > 0),
  comp_cm  integer check (comp_cm > 0),

  -- Só linha pedagógica.
  arquivo_path text,

  criado_em timestamptz not null default now()
);

-- Produto físico precisa de medidas para cotar frete; digital precisa de
-- arquivo. O banco recusa o que a loja não conseguiria vender.
alter table produtos add constraint produto_coerente check (
  case
    when linha = 'Papelaria personalizada'
      then peso_g is not null and alt_cm is not null
           and larg_cm is not null and comp_cm is not null
    else arquivo_path is not null
  end
);

create index produtos_linha_ativo on produtos (linha, ativo);

-- O catálogo é público: qualquer visitante lê produto ativo.
-- Escrita fica fora da chave anônima, e vai pelo painel com service role.
alter table produtos enable row level security;

create policy "catálogo público" on produtos
  for select using (ativo = true);
```

- [ ] **Passo 4: Aplicar a migration**

```bash
cd loja
npx supabase login
npx supabase link --project-ref <ref-do-projeto>
npx supabase db push
```

O `project-ref` está na URL do painel do Supabase.

Se o `db push` falhar por falta de Docker, colar o conteúdo do `.sql` no SQL Editor do painel. A migration continua versionada no repositório de qualquer forma.

- [ ] **Passo 5: Conferir que a tabela existe e a regra pega**

No SQL Editor do Supabase, rodar:

```sql
-- Deve falhar: produto físico sem medidas.
insert into produtos (slug, nome, preco_reais, linha, minimo, prazo_producao)
values ('teste', 'Teste', 10, 'Papelaria personalizada', 10, 5);
```

Esperado: erro `violates check constraint "produto_coerente"`.

- [ ] **Passo 6: Commit**

```bash
cd ..
git add loja/supabase loja/.env.example
git commit -m "feat: schema do catálogo, com regra que recusa produto invendável"
```

---

## Tarefa 3: Regras do carrinho como código testado — FEITA em 11/08/2026

**Arquivos:**
- Criar: `loja/src/dominio/produto.ts`
- Criar: `loja/src/dominio/carrinho.ts`
- Criar: `loja/src/dominio/carrinho.test.ts`

**Interfaces:**
- Consome: `Linha`, `ehDigital` da Tarefa 1
- Produz: `type Produto`, `type ItemCarrinho`, `quantidadeMinima`, `podeAdicionar`, `adicionar`, `alterarQuantidade`, `totalCarrinho`

- [ ] **Passo 1: Definir o tipo Produto**

Criar `loja/src/dominio/produto.ts`:

```typescript
import type { Linha } from './linhas'

/**
 * Produto como o resto do sistema enxerga.
 *
 * `preco` é em reais, com centavos. As medidas são do pacote fechado de
 * `minimo` unidades, e só existem na linha personalizada.
 */
export interface Produto {
  id: string
  slug: string
  nome: string
  descricao: string
  preco: number
  linha: Linha
  minimo: number
  prazoProducao: number
  pesoG?: number
  altCm?: number
  largCm?: number
  compCm?: number
}
```

- [ ] **Passo 2: Escrever os testes que falham**

Criar `loja/src/dominio/carrinho.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { LINHA_PERSONALIZADA, LINHA_PEDAGOGICA } from './linhas'
import type { Produto } from './produto'
import {
  quantidadeMinima,
  podeAdicionar,
  adicionar,
  alterarQuantidade,
  totalCarrinho,
} from './carrinho'

const caneca: Produto = {
  id: '1', slug: 'caneca', nome: 'Caneca personalizada', descricao: '',
  preco: 32, linha: LINHA_PERSONALIZADA, minimo: 10, prazoProducao: 5,
  pesoG: 4000, altCm: 20, largCm: 30, compCm: 30,
}

const caderno: Produto = {
  ...caneca, id: '2', slug: 'caderno', nome: 'Caderno personalizado', preco: 18,
}

const apostila: Produto = {
  id: '3', slug: 'apostila', nome: 'Apostila adaptada', descricao: '',
  preco: 47, linha: LINHA_PEDAGOGICA, minimo: 1, prazoProducao: 0,
}

describe('quantidade mínima', () => {
  it('produto personalizado começa no mínimo do produto', () => {
    expect(quantidadeMinima(caneca)).toBe(10)
  })

  it('material digital é sempre uma unidade', () => {
    expect(quantidadeMinima(apostila)).toBe(1)
  })
})

describe('mistura de linhas', () => {
  it('carrinho vazio aceita qualquer produto', () => {
    expect(podeAdicionar([], caneca).ok).toBe(true)
    expect(podeAdicionar([], apostila).ok).toBe(true)
  })

  it('produtos da mesma linha somam', () => {
    const carrinho = adicionar([], caneca)
    expect(podeAdicionar(carrinho, caderno).ok).toBe(true)
  })

  it('digital não entra em carrinho de personalizado', () => {
    const carrinho = adicionar([], caneca)
    const resultado = podeAdicionar(carrinho, apostila)
    expect(resultado.ok).toBe(false)
    expect(resultado.motivo).toMatch(/compras separadas/)
  })

  it('personalizado não entra em carrinho digital', () => {
    const carrinho = adicionar([], apostila)
    expect(podeAdicionar(carrinho, caneca).ok).toBe(false)
  })

  it('a regra vale para o carrinho todo, não só o primeiro item', () => {
    let carrinho = adicionar([], caneca)
    carrinho = adicionar(carrinho, caderno)
    expect(podeAdicionar(carrinho, apostila).ok).toBe(false)
  })
})

describe('adicionar', () => {
  it('produto personalizado entra já no mínimo', () => {
    const carrinho = adicionar([], caneca)
    expect(carrinho[0].quantidade).toBe(10)
  })

  it('adicionar de novo soma uma unidade', () => {
    let carrinho = adicionar([], caneca)
    carrinho = adicionar(carrinho, caneca)
    expect(carrinho).toHaveLength(1)
    expect(carrinho[0].quantidade).toBe(11)
  })

  it('material digital não duplica', () => {
    let carrinho = adicionar([], apostila)
    carrinho = adicionar(carrinho, apostila)
    expect(carrinho).toHaveLength(1)
    expect(carrinho[0].quantidade).toBe(1)
  })
})

describe('alterar quantidade', () => {
  it('abaixo do mínimo, o produto sai do carrinho', () => {
    const carrinho = alterarQuantidade(adicionar([], caneca), caneca.id, 9)
    expect(carrinho).toHaveLength(0)
  })

  it('no mínimo, o produto fica', () => {
    const carrinho = alterarQuantidade(adicionar([], caneca), caneca.id, 10)
    expect(carrinho[0].quantidade).toBe(10)
  })
})

describe('total', () => {
  it('multiplica preço pela quantidade', () => {
    expect(totalCarrinho(adicionar([], caneca))).toBe(320)
  })

  it('soma os itens', () => {
    let carrinho = adicionar([], caneca)
    carrinho = adicionar(carrinho, caderno)
    expect(totalCarrinho(carrinho)).toBe(320 + 180)
  })

  it('carrinho vazio soma zero', () => {
    expect(totalCarrinho([])).toBe(0)
  })

  it('não acumula erro de centavo visível', () => {
    const item = { ...caneca, preco: 18.9 }
    expect(totalCarrinho(adicionar([], item)).toFixed(2)).toBe('189.00')
  })
})
```

- [ ] **Passo 3: Rodar e confirmar que falha**

```bash
npm test
```

Esperado: FAIL, `Failed to resolve import "./carrinho"`.

- [ ] **Passo 4: Implementar**

Criar `loja/src/dominio/carrinho.ts`:

```typescript
import { ehDigital } from './linhas'
import type { Produto } from './produto'

/**
 * Regras do carrinho.
 *
 * Módulo puro: sem React, sem banco, sem fetch. É o que permite testar as
 * regras de venda em milissegundos e reaproveitá-las no painel sem
 * arrastar a loja junto.
 *
 * A regra que mais surpreende quem lê: uma compra é de uma linha só. Veio
 * da cliente, e o motivo é bom — a declaração de conteúdo precisa bater
 * com o que está dentro da caixa, e um arquivo digital declarado é um item
 * que não está na embalagem.
 */

export interface ItemCarrinho extends Produto {
  quantidade: number
}

export type Permissao =
  | { ok: true }
  | { ok: false; motivo: string }

/** Digital é arquivo: uma unidade. Físico começa no mínimo do produto. */
export const quantidadeMinima = (produto: Produto): number =>
  ehDigital(produto.linha) ? 1 : produto.minimo

/** Arquivo digital não se compra em dobro. */
export const permiteVariasUnidades = (produto: Produto): boolean =>
  !ehDigital(produto.linha)

export const podeAdicionar = (carrinho: ItemCarrinho[], produto: Produto): Permissao => {
  if (carrinho.length === 0) return { ok: true }

  const carrinhoDigital = ehDigital(carrinho[0].linha)
  const produtoDigital = ehDigital(produto.linha)

  if (carrinhoDigital === produtoDigital) return { ok: true }

  return {
    ok: false,
    motivo: carrinhoDigital
      ? 'Material digital e produtos personalizados vão em compras separadas. Finalize esta compra e faça outra para os personalizados.'
      : 'Material digital e produtos personalizados vão em compras separadas. Finalize esta compra e faça outra para o material digital.',
  }
}

/**
 * Devolve um carrinho novo. Se o produto não pode entrar, devolve o
 * carrinho como estava — quem chama consulta `podeAdicionar` antes para
 * mostrar o motivo ao comprador.
 */
export const adicionar = (carrinho: ItemCarrinho[], produto: Produto): ItemCarrinho[] => {
  if (!podeAdicionar(carrinho, produto).ok) return carrinho

  const existente = carrinho.find((item) => item.id === produto.id)

  if (!existente) {
    return [...carrinho, { ...produto, quantidade: quantidadeMinima(produto) }]
  }

  if (!permiteVariasUnidades(produto)) return carrinho

  return carrinho.map((item) =>
    item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
  )
}

/** Abaixo do mínimo do produto, a linha sai do carrinho. */
export const alterarQuantidade = (
  carrinho: ItemCarrinho[],
  produtoId: string,
  quantidade: number
): ItemCarrinho[] =>
  carrinho.flatMap((item) => {
    if (item.id !== produtoId) return [item]
    if (quantidade < quantidadeMinima(item)) return []
    return [{ ...item, quantidade }]
  })

export const remover = (carrinho: ItemCarrinho[], produtoId: string): ItemCarrinho[] =>
  carrinho.filter((item) => item.id !== produtoId)

export const subtotalItem = (item: ItemCarrinho): number => item.preco * item.quantidade

export const totalCarrinho = (carrinho: ItemCarrinho[]): number =>
  carrinho.reduce((soma, item) => soma + subtotalItem(item), 0)
```

- [ ] **Passo 5: Rodar e confirmar que passa**

```bash
npm test
```

Esperado: PASS, 19 testes (3 de linhas + 16 de carrinho).

- [ ] **Passo 6: Commit**

```bash
cd ..
git add loja/src/dominio
git commit -m "feat: regras do carrinho como código testado, fora da interface"
```

---

## Tarefa 4: Leitura do catálogo no Supabase

**Arquivos:**
- Criar: `loja/src/dados/supabase.ts`
- Criar: `loja/src/dados/produtos.ts`
- Criar: `loja/src/dados/produtos.test.ts`
- Criar: `loja/supabase/seed.sql`

**Interfaces:**
- Consome: `Produto` da Tarefa 3, tabela `produtos` da Tarefa 2
- Produz: `listarProdutos(linha?: Linha): Promise<Produto[]>`, `buscarPorSlug(slug: string): Promise<Produto | null>`, `paraProduto(linha: LinhaBanco): Produto`

- [ ] **Passo 1: Instalar o cliente**

```bash
cd loja
npm install @supabase/supabase-js
```

- [ ] **Passo 2: Criar o cliente**

Criar `loja/src/dados/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de leitura do catálogo.
 *
 * Usa a chave anônima, que só enxerga produto ativo — é o que a política
 * de acesso da tabela permite. Escrita não passa por aqui: vai pelo painel,
 * com credencial de serviço, que nunca chega ao navegador.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !chave) {
  throw new Error(
    'Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. Copie loja/.env.example para loja/.env.local e preencha.'
  )
}

export const supabase = createClient(url, chave)
```

- [ ] **Passo 3: Escrever o teste da conversão**

A conversão do formato do banco para `Produto` é onde os erros moram — nome de coluna com underscore virando camelCase, número vindo como string. É isso que o teste cobre; a chamada de rede não.

Criar `loja/src/dados/produtos.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { paraProduto } from './produtos'
import { LINHA_PERSONALIZADA, LINHA_PEDAGOGICA } from '@/dominio/linhas'

describe('conversão do formato do banco', () => {
  it('converte produto personalizado com as medidas', () => {
    const produto = paraProduto({
      id: 'abc', slug: 'caneca', nome: 'Caneca', descricao: 'Com nome',
      preco_reais: '32.00', linha: LINHA_PERSONALIZADA, ativo: true,
      minimo: 10, prazo_producao: 5,
      peso_g: 4000, alt_cm: 20, larg_cm: 30, comp_cm: 30,
      arquivo_path: null,
    })

    expect(produto.preco).toBe(32)
    expect(produto.prazoProducao).toBe(5)
    expect(produto.pesoG).toBe(4000)
  })

  it('preço vem como texto do Postgres e vira número', () => {
    const produto = paraProduto({
      id: 'abc', slug: 'x', nome: 'X', descricao: '',
      preco_reais: '18.90', linha: LINHA_PEDAGOGICA, ativo: true,
      minimo: 1, prazo_producao: 0,
      peso_g: null, alt_cm: null, larg_cm: null, comp_cm: null,
      arquivo_path: 'atividades/x.pdf',
    })

    expect(produto.preco).toBe(18.9)
    expect(typeof produto.preco).toBe('number')
  })

  it('produto digital não traz medidas', () => {
    const produto = paraProduto({
      id: 'abc', slug: 'x', nome: 'X', descricao: '',
      preco_reais: '47.00', linha: LINHA_PEDAGOGICA, ativo: true,
      minimo: 1, prazo_producao: 0,
      peso_g: null, alt_cm: null, larg_cm: null, comp_cm: null,
      arquivo_path: 'atividades/x.pdf',
    })

    expect(produto.pesoG).toBeUndefined()
  })
})
```

- [ ] **Passo 4: Rodar e confirmar que falha**

```bash
npm test
```

Esperado: FAIL, `Failed to resolve import "./produtos"`.

- [ ] **Passo 5: Implementar**

Criar `loja/src/dados/produtos.ts`:

```typescript
import { supabase } from './supabase'
import type { Produto } from '@/dominio/produto'
import type { Linha } from '@/dominio/linhas'

/**
 * Leitura do catálogo. Único lugar do sistema que fala com o banco de
 * produtos — o resto recebe `Produto` pronto e não sabe que Postgres existe.
 */

/** Formato cru da tabela. numeric vem como string no driver do Postgres. */
export interface LinhaBanco {
  id: string
  slug: string
  nome: string
  descricao: string
  preco_reais: string | number
  linha: string
  ativo: boolean
  minimo: number
  prazo_producao: number
  peso_g: number | null
  alt_cm: number | null
  larg_cm: number | null
  comp_cm: number | null
  arquivo_path: string | null
}

const COLUNAS =
  'id, slug, nome, descricao, preco_reais, linha, ativo, minimo, prazo_producao, peso_g, alt_cm, larg_cm, comp_cm, arquivo_path'

/** numeric do Postgres chega como string; sem isso o total soma texto. */
export const paraProduto = (linha: LinhaBanco): Produto => ({
  id: linha.id,
  slug: linha.slug,
  nome: linha.nome,
  descricao: linha.descricao,
  preco: Number(linha.preco_reais),
  linha: linha.linha as Linha,
  minimo: linha.minimo,
  prazoProducao: linha.prazo_producao,
  pesoG: linha.peso_g ?? undefined,
  altCm: linha.alt_cm ?? undefined,
  largCm: linha.larg_cm ?? undefined,
  compCm: linha.comp_cm ?? undefined,
})

export const listarProdutos = async (linha?: Linha): Promise<Produto[]> => {
  let consulta = supabase.from('produtos').select(COLUNAS).eq('ativo', true)

  if (linha) consulta = consulta.eq('linha', linha)

  const { data, error } = await consulta.order('criado_em', { ascending: false })

  if (error) throw new Error(`Não foi possível ler o catálogo: ${error.message}`)

  return (data as LinhaBanco[]).map(paraProduto)
}

export const buscarPorSlug = async (slug: string): Promise<Produto | null> => {
  const { data, error } = await supabase
    .from('produtos')
    .select(COLUNAS)
    .eq('slug', slug)
    .eq('ativo', true)
    .maybeSingle()

  if (error) throw new Error(`Não foi possível ler o produto: ${error.message}`)

  return data ? paraProduto(data as LinhaBanco) : null
}
```

- [ ] **Passo 6: Rodar e confirmar que passa**

```bash
npm test
```

Esperado: PASS, 22 testes.

- [ ] **Passo 7: Popular o catálogo de exemplo**

Criar `loja/supabase/seed.sql`:

```sql
-- Catálogo de exemplo, para desenvolver antes de a cliente mandar o dela.
-- Nomes e preços são plausíveis, não são os produtos reais.

insert into produtos
  (slug, nome, descricao, preco_reais, linha, minimo, prazo_producao, peso_g, alt_cm, larg_cm, comp_cm)
values
  ('caderno-personalizado', 'Caderno personalizado',
   'Capa com o nome de quem vai usar.', 32.00,
   'Papelaria personalizada', 10, 5, 4000, 20, 30, 30),
  ('cartela-adesivos', 'Cartela de adesivos escolares',
   'Etiquetas para material escolar, com nome e turma.', 18.00,
   'Papelaria personalizada', 10, 5, 800, 5, 22, 32),
  ('bloco-anotacoes', 'Bloco de anotações',
   'Bloco personalizado, ideal para lembrancinha.', 24.00,
   'Papelaria personalizada', 10, 5, 2500, 12, 20, 28);

insert into produtos
  (slug, nome, descricao, preco_reais, linha, minimo, prazo_producao, arquivo_path)
values
  ('apostila-alfabetizacao', 'Apostila de alfabetização adaptada',
   'Material estruturado com apoio visual, para imprimir em casa.', 47.00,
   'Papelaria pedagógica', 1, 0, 'atividades/apostila-alfabetizacao.pdf'),
  ('kit-rotina-visual', 'Kit rotina visual',
   'Quadro de rotina para montar e usar no dia a dia.', 39.00,
   'Papelaria pedagógica', 1, 0, 'atividades/kit-rotina-visual.pdf'),
  ('jogo-das-emocoes', 'Jogo das emoções',
   'Atividade lúdica para identificar sentimentos.', 29.00,
   'Papelaria pedagógica', 1, 0, 'atividades/jogo-das-emocoes.pdf');
```

Rodar no SQL Editor do Supabase, ou:

```bash
npx supabase db execute --file supabase/seed.sql
```

- [ ] **Passo 8: Commit**

```bash
cd ..
git add loja/src/dados loja/supabase/seed.sql loja/package.json loja/package-lock.json
git commit -m "feat: leitura do catálogo no Supabase, com conversão testada"
```

---

## Tarefa 5: Identidade visual em tokens do Tailwind — FEITA em 11/08/2026

**Arquivos:**
- Modificar: `loja/src/app/globals.css`
- Modificar: `loja/src/app/layout.tsx`
- Criar: `loja/src/componentes/SeloLinha.tsx`

**Interfaces:**
- Consome: `Linha`, `ehDigital` da Tarefa 1
- Produz: classes `bg-paper`, `text-ink`, `border-rule`, `bg-chalk`, `bg-marker`, `text-heart`, `font-display`, `font-corpo`; componente `<SeloLinha linha={...} />`

- [ ] **Passo 1: Definir os tokens**

Substituir o conteúdo de `loja/src/app/globals.css`:

```css
@import "tailwindcss";

/* Paleta e tipografia da loja.
   Ver docs/superpowers/specs/2026-08-10-identidade-visual-design.md

   Cada cor saiu de uma das duas logos que a cliente já usava no Elo7.
   Regra dura: o amarelo nunca é cor de texto — sobre branco tem contraste
   de 1.3:1. Ele só entra como preenchimento, com a tinta escrita por cima. */

@theme {
  --color-paper: #FBFAF7;
  --color-surface: #FFFFFF;
  --color-ink: #12305B;
  --color-ink-soft: #6B7C8F;
  --color-rule: #A8C6E8;
  --color-rule-faint: #DCE9F6;
  --color-chalk: #2E9B96;
  --color-marker: #FFD400;
  --color-heart: #C4436B;

  --font-display: Fraunces, Georgia, serif;
  --font-corpo: "Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif;
}

body {
  background-color: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-corpo);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display);
  text-wrap: balance;
}
```

- [ ] **Passo 2: Carregar as fontes**

Substituir `loja/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Fraunces, Atkinson_Hyperlegible } from 'next/font/google'
import './globals.css'

/* A Atkinson Hyperlegible é escolha funcional, não estética: foi desenhada
   pelo Braille Institute para diferenciar caracteres ambíguos (I, l, 1).
   Boa parte de quem compra a linha pedagógica compra por acessibilidade. */

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-fraunces',
})

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
})

export const metadata: Metadata = {
  title: 'Feito para você! Personalizados',
  description:
    'Papelaria personalizada e material pedagógico para quem ensina.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${atkinson.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Passo 3: Criar o selo de linha**

Criar `loja/src/componentes/SeloLinha.tsx`:

```tsx
import { ehDigital, type Linha } from '@/dominio/linhas'

/**
 * Selo que identifica a linha do produto pela cor.
 *
 * Verde-água na personalizada, amarelo na pedagógica. No amarelo o texto é
 * tinta escura, nunca branco: amarelo com texto branco é ilegível.
 */
export function SeloLinha({ linha }: { linha: Linha }) {
  const digital = ehDigital(linha)

  return (
    <span
      className={`inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
        digital ? 'bg-marker text-ink' : 'bg-chalk text-white'
      }`}
    >
      {linha}
    </span>
  )
}
```

- [ ] **Passo 4: Conferir no navegador**

```bash
cd loja
npm run dev
```

Abrir `http://localhost:3000`. O fundo deve estar levemente quente (`#FBFAF7`), não branco puro, e o texto azul-escuro, não preto.

- [ ] **Passo 5: Commit**

```bash
cd ..
git add loja/src/app loja/src/componentes
git commit -m "feat: identidade visual como tokens, com as fontes reais"
```

---

## Tarefa 6: Catálogo e página de produto

**Arquivos:**
- Criar: `loja/src/componentes/CardProduto.tsx`
- Modificar: `loja/src/app/page.tsx`
- Criar: `loja/src/app/produto/[slug]/page.tsx`
- Criar: `loja/src/formato.ts`
- Criar: `loja/src/formato.test.ts`

**Interfaces:**
- Consome: `listarProdutos`, `buscarPorSlug` da Tarefa 4; `quantidadeMinima` da Tarefa 3; `SeloLinha` da Tarefa 5
- Produz: `moeda(valor: number): string`; componente `<CardProduto produto={...} />`

- [ ] **Passo 1: Escrever o teste do formato de moeda**

Criar `loja/src/formato.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { moeda } from './formato'

describe('moeda', () => {
  it('usa vírgula como separador decimal', () => {
    expect(moeda(32)).toBe('R$ 32,00')
  })

  it('mostra os centavos', () => {
    expect(moeda(18.9)).toBe('R$ 18,90')
  })

  it('separa o milhar com ponto', () => {
    expect(moeda(1234.5)).toBe('R$ 1.234,50')
  })
})
```

- [ ] **Passo 2: Rodar e confirmar que falha**

```bash
cd loja && npm test
```

Esperado: FAIL, `Failed to resolve import "./formato"`.

- [ ] **Passo 3: Implementar o formato**

Criar `loja/src/formato.ts`:

```typescript
/** Valores em reais, do jeito que se lê no Brasil. */
export const moeda = (valor: number): string =>
  valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).replace(' ', ' ')
```

- [ ] **Passo 4: Rodar e confirmar que passa**

```bash
npm test
```

Esperado: PASS, 25 testes.

- [ ] **Passo 5: Criar o card**

Criar `loja/src/componentes/CardProduto.tsx`:

```tsx
import Link from 'next/link'
import type { Produto } from '@/dominio/produto'
import { quantidadeMinima } from '@/dominio/carrinho'
import { ehDigital } from '@/dominio/linhas'
import { SeloLinha } from './SeloLinha'
import { moeda } from '@/formato'

/**
 * Card do catálogo.
 *
 * A regra de venda aparece antes do botão, de propósito: ninguém deve
 * descobrir o mínimo de 10 peças só no carrinho. Numa linha de R$ 32 a
 * unidade, o menor pedido possível é R$ 320 — quem só vê isso no fim
 * desiste ali.
 */
export function CardProduto({ produto }: { produto: Produto }) {
  const digital = ehDigital(produto.linha)
  const minimo = quantidadeMinima(produto)

  return (
    <Link
      href={`/produto/${produto.slug}`}
      className="flex flex-col overflow-hidden rounded-xl border border-rule bg-surface transition hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-chalk"
    >
      <div
        className={`flex aspect-[5/4] items-center justify-center border-b border-rule text-[10px] uppercase tracking-wider text-ink-soft ${
          digital ? 'bg-marker/15' : 'bg-chalk/10'
        }`}
      >
        Aqui entra sua foto
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <SeloLinha linha={produto.linha} />

        <h2 className="font-corpo text-base font-bold leading-snug">{produto.nome}</h2>

        <p className="text-sm text-ink-soft">{produto.descricao}</p>

        <p className="mt-auto pt-2 text-lg font-bold tabular-nums">
          {moeda(produto.preco)}
          {!digital && <span className="ml-1 text-sm font-normal text-ink-soft">cada</span>}
        </p>

        <p className="text-sm font-bold">
          {digital
            ? 'Arquivo digital · chega na hora do pagamento'
            : `Mínimo ${minimo} un. — ${moeda(produto.preco * minimo)} · pronto em ${produto.prazoProducao} dias úteis`}
        </p>
      </div>
    </Link>
  )
}
```

- [ ] **Passo 6: Criar o catálogo**

Substituir `loja/src/app/page.tsx`:

```tsx
import Link from 'next/link'
import { listarProdutos } from '@/dados/produtos'
import { LINHAS, type Linha } from '@/dominio/linhas'
import { CardProduto } from '@/componentes/CardProduto'

/* Revalida de hora em hora: o catálogo muda pouco e a página servida
   estática abre rápido no celular de quem chega pelo Instagram. */
export const revalidate = 3600

export default async function Catalogo({
  searchParams,
}: {
  searchParams: Promise<{ linha?: string }>
}) {
  const { linha } = await searchParams
  const filtro = LINHAS.includes(linha as Linha) ? (linha as Linha) : undefined
  const produtos = await listarProdutos(filtro)

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">
          Feito para você! <span className="text-chalk">Personalizados</span>
        </h1>
        <p className="mt-2 text-ink-soft">
          Papelaria personalizada e material pedagógico para quem ensina.
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Filtrar por linha">
        <FiltroLink ativo={!filtro} href="/">Todos</FiltroLink>
        {LINHAS.map((nome) => (
          <FiltroLink key={nome} ativo={filtro === nome} href={`/?linha=${encodeURIComponent(nome)}`}>
            {nome}
          </FiltroLink>
        ))}
      </nav>

      {produtos.length === 0 ? (
        <p className="rounded-xl border border-rule bg-surface p-8 text-center text-ink-soft">
          Nenhum produto nesta linha ainda.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {produtos.map((produto) => (
            <CardProduto key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </main>
  )
}

function FiltroLink({
  href, ativo, children,
}: { href: string; ativo: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={ativo ? 'page' : undefined}
      className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
        ativo ? 'border-ink bg-ink text-white' : 'border-rule text-ink hover:bg-surface'
      }`}
    >
      {children}
    </Link>
  )
}
```

- [ ] **Passo 7: Criar a página de produto**

Criar `loja/src/app/produto/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { buscarPorSlug, listarProdutos } from '@/dados/produtos'
import { quantidadeMinima } from '@/dominio/carrinho'
import { ehDigital } from '@/dominio/linhas'
import { SeloLinha } from '@/componentes/SeloLinha'
import { moeda } from '@/formato'

export const revalidate = 3600

export async function generateStaticParams() {
  const produtos = await listarProdutos()
  return produtos.map((produto) => ({ slug: produto.slug }))
}

export default async function PaginaProduto({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const produto = await buscarPorSlug(slug)

  if (!produto) notFound()

  const digital = ehDigital(produto.linha)
  const minimo = quantidadeMinima(produto)

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/" className="text-sm font-bold text-chalk hover:underline">
        ← Voltar para a loja
      </Link>

      <div className="mt-6 flex flex-col gap-4">
        <SeloLinha linha={produto.linha} />

        <h1 className="text-3xl font-semibold">{produto.nome}</h1>

        <p className="text-ink-soft">{produto.descricao}</p>

        <div className="rounded-xl border border-rule bg-surface p-5">
          <p className="text-2xl font-bold tabular-nums">
            {moeda(produto.preco)}
            {!digital && <span className="ml-1 text-base font-normal text-ink-soft">cada</span>}
          </p>

          {digital ? (
            <p className="mt-2 text-sm">
              Arquivo digital. Chega no seu e-mail assim que o pagamento for aprovado, sem frete.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm font-bold">
                Mínimo de {minimo} unidades — {moeda(produto.preco * minimo)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Feito sob encomenda, pronto em {produto.prazoProducao} dias úteis depois do
                pagamento. O frete é calculado pelo seu CEP na hora da compra.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Passo 8: Conferir no navegador**

```bash
npm run dev
```

Conferir, nesta ordem:

1. `http://localhost:3000` lista os seis produtos do seed
2. Clicar em "Papelaria pedagógica" filtra para três, e o endereço vira `/?linha=...`
3. Um card personalizado mostra "Mínimo 10 un. — R$ 320,00 · pronto em 5 dias úteis"
4. Um card pedagógico mostra "chega na hora do pagamento", sem mínimo
5. Clicar num card abre a página do produto
6. `http://localhost:3000/produto/nao-existe` devolve 404
7. Reduzir a janela para 375px de largura: a página não rola para os lados

- [ ] **Passo 9: Rodar tudo e commitar**

```bash
npm test && npm run lint && npm run build
```

Esperado: 25 testes passando, lint limpo, build sem erro.

```bash
cd ..
git add loja/src
git commit -m "feat: catálogo com filtro por linha e página de produto"
```

---

## O que esta fase entrega

Uma loja real, servida do banco, onde:

- o catálogo vem do Supabase e filtra por linha
- cada produto tem página própria, com endereço que dá para mandar no WhatsApp
- a regra de venda aparece antes do botão, não no carrinho
- as regras de venda são código testado num módulo puro, não texto espalhado por componente

Ainda **não** existe: carrinho na interface, checkout, pagamento, frete, entrega digital e painel.

## Próximas fases

| Fase | Entrega | Depende de resposta da cliente? |
|---|---|---|
| 2 — Carrinho e checkout | Carrinho com quantidade e bloqueio de mistura, formulário de entrega | Não |
| 3 — Pagamento | Checkout transparente do Mercado Pago, webhook idempotente e assinado | Não |
| 4 — Frete e etiqueta | Cotação Melhor Envio, etiqueta e declaração de conteúdo | Não |
| 5 — Entrega digital | Link com validade e marca d'água | **Sim** — formato do arquivo e aprovação da marca d'água |
| 6 — Painel | Cadastro de produto, lista de pedidos, botão de etiqueta | Não |

A fase 5 é a única bloqueada. As outras podem começar hoje.

## Antes de começar a fase 1

Duas coisas do escopo maior que não cabem numa tarefa e não podem ser esquecidas:

1. **Registrar o domínio.** A cliente decidiu o nome e endereço bom some rápido.
2. **Decidir o documento fiscal.** Declaração de conteúdo não cobre avaria; nota fiscal cobre. Produto personalizado quebrado não pode ser revendido, porque cada peça tem o nome de alguém. A cliente é MEI e pode emitir. Ver a spec de arquitetura.
