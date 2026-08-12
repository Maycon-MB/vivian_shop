/**
 * Configurações da loja.
 *
 * Só o que ela mesma muda. Chave de integração e endereço de banco não
 * aparecem aqui: são coisas que, se editadas por engano, derrubam a loja
 * sem ela entender por quê.
 */
export default function Configuracoes() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="mt-1 text-ink-soft">O que você pode mudar sozinha, quando quiser.</p>
      </div>

      <Bloco titulo="Sua loja">
        <Campo rotulo="Nome que aparece no site">
          <input className={entrada} defaultValue="Feito para você! Personalizados" />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="E-mail de contato">
            <input className={entrada} placeholder="seu@email.com" />
          </Campo>
          <Campo rotulo="WhatsApp">
            <input className={entrada} placeholder="(21) 90000-0000" />
          </Campo>
        </div>
      </Bloco>

      <Bloco
        titulo="De onde você envia"
        dica="Usado para calcular o frete. Este endereço aparece como remetente nas etiquetas."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="CEP">
            <input className={entrada} placeholder="00000-000" />
          </Campo>
          <Campo rotulo="Cidade">
            <input className={entrada} placeholder="Rio de Janeiro" />
          </Campo>
        </div>
      </Bloco>

      <Bloco titulo="Como você trabalha">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            rotulo="Mínimo padrão de unidades"
            dica="Vale para produto novo. Dá para mudar em cada produto."
          >
            <input className={entrada} defaultValue="10" inputMode="numeric" />
          </Campo>
          <Campo rotulo="Prazo padrão de produção" dica="Em dias úteis.">
            <input className={entrada} defaultValue="5" inputMode="numeric" />
          </Campo>
        </div>
      </Bloco>

      <Bloco titulo="Avisos">
        <Opcao rotulo="Me avisar no WhatsApp quando entrar um pedido" marcada />
        <Opcao rotulo="Me avisar quando um produto acabar" marcada />
        <Opcao rotulo="Resumo por e-mail toda segunda-feira" />
      </Bloco>

      <div>
        <button
          type="button"
          className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
        >
          Salvar
        </button>
      </div>
    </div>
  )
}

const entrada =
  'w-full rounded-lg border border-rule bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-chalk focus:ring-2 focus:ring-chalk/25'

function Bloco({
  titulo,
  dica,
  children,
}: {
  titulo: string
  dica?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-rule bg-surface p-5">
      <div>
        <h2 className="font-corpo text-sm font-bold uppercase tracking-wider text-ink-soft">
          {titulo}
        </h2>
        {dica && <p className="mt-1 text-sm text-ink-soft">{dica}</p>}
      </div>
      {children}
    </section>
  )
}

function Campo({
  rotulo,
  dica,
  children,
}: {
  rotulo: string
  dica?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold">{rotulo}</span>
      {children}
      {dica && <span className="text-xs text-ink-soft">{dica}</span>}
    </label>
  )
}

function Opcao({ rotulo, marcada }: { rotulo: string; marcada?: boolean }) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        defaultChecked={marcada}
        className="h-4 w-4 accent-[var(--color-chalk)]"
      />
      {rotulo}
    </label>
  )
}
