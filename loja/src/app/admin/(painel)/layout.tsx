import { ExigirDona } from '@/componentes/ExigirDona'

/**
 * Tudo aqui dentro exige ser dona da loja.
 *
 * Entrar e criar conta ficam de fora deste grupo, um nível acima: seria
 * um belo círculo exigir login para chegar à tela de login.
 *
 * O guarda esconde a tela; quem segura os dados é a política do banco, que
 * roda no servidor. Os dois existem porque fazem coisas diferentes: sem o
 * guarda, um estranho veria a moldura do painel e as telas de exemplo;
 * sem a política, veria os pedidos de verdade.
 */
export default function LayoutDoPainel({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ExigirDona>{children}</ExigirDona>
}
