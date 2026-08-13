import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

/**
 * Dois tipos de teste, dois ambientes.
 *
 * As regras de negócio e os serviços rodam em Node: são funções puras, não
 * precisam de navegador, e assim continuam custando milissegundos. Os
 * testes de tela rodam em jsdom, que é um navegador de mentira — mais
 * lento, mas é o único jeito de apertar um botão.
 *
 * A divisão é pela extensão do arquivo, e não por configuração espalhada:
 * `.test.ts` é regra, `.test.tsx` é tela. Quem escrever o próximo teste
 * não precisa lembrar de configurar nada.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    projects: [
      {
        plugins: [react()],
        resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
        test: {
          name: 'regras',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        plugins: [react()],
        resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
        test: {
          name: 'telas',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
