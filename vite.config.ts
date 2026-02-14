/// <reference types="vitest" />

import type { Plugin } from 'vite'

import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
/* eslint-disable node/prefer-global/process */
import colors from 'kleur'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig } from 'vitest/config'

import { generateSolutions, generateSolutionsFileContent } from './scripts/build-solutions'

const log = (value: string) => {
  const timestamp = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    hour12: true,
    minute: '2-digit',
    second: '2-digit'
  })
  console.log(`${timestamp} ${colors.bold(colors.yellow('[advent-ui]'))} ${value}`)
}

const generateSolutionFile = async () => {
  log('scanning routes for solutions...')

  const routesDir = join(process.cwd(), 'src/routes')
  const outputFile = join(process.cwd(), 'src/lib/data/solutions.ts')

  const solutionsResult = await generateSolutions(routesDir)

  if (solutionsResult.isErr()) {
    log(`failed to generate solutions: ${solutionsResult.error.message}`)
    throw solutionsResult.error
  }

  const solutions = solutionsResult.value
  const fileContent = generateSolutionsFileContent(solutions)

  try {
    await writeFile(outputFile, fileContent, 'utf-8')

    const solutionCount = Object.values(solutions).reduce((total, year) => total + Object.keys(year).length, 0)

    log(
      `generated solutions.ts with ${colors.green(solutionCount)} solutions across ${colors.green(Object.keys(solutions).length)} years`
    )

    return outputFile
  } catch (error) {
    log(`failed to write solutions file: ${error}`)
    throw error
  }
}

export const solutionsGeneratorPlugin = (): Plugin => ({
  buildStart: async () => {
    await generateSolutionFile()
  },
  configureServer: (server) => {
    // Add a watcher for route changes to regenerate solutions
    server.middlewares.use((_, __, next) => {
      next()
    })
  },
  handleHotUpdate: async ({ file, server }) => {
    if (!file.includes('/routes/') || (!file.endsWith('+page.svelte') && !file.endsWith('metadata.ts'))) {
      return
    }

    log('route changed, regenerating solutions...')

    const outputFile = await generateSolutionFile()

    // Trigger HMR for the solutions module and importers
    const solutionsModule = server.moduleGraph.getModuleById(outputFile)
    if (solutionsModule) {
      server.reloadModule(solutionsModule)
    }
    const importers = solutionsModule?.importers || new Set()
    for (const importer of importers) {
      server.reloadModule(importer)
    }
  },
  name: 'solutions-generator'
})

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), solutionsGeneratorPlugin()],
  test: {
    globals: true
  }
})

