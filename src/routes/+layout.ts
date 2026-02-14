import type { LayoutLoad } from './$types'
import type { HighlighterCore } from 'shiki/core'

import { injectAnalytics } from '@vercel/analytics/sveltekit'
import { createHighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import shellsessionLang from 'shiki/langs/shellscript.mjs'
import githubLightDefault from 'shiki/themes/github-light-default.mjs'

import { dev } from '$app/environment'
import { DENY_ANALYTICS } from '$lib/components'

export const prerender = true

let cachedHighlighter: HighlighterCore | undefined

export const load: LayoutLoad = async ({ url }) => {
  if (cachedHighlighter) {
    return { pathname: url.pathname, shiki: cachedHighlighter }
  }

  const modifiedTheme = {
    ...githubLightDefault,
    colors: {
      ...(githubLightDefault.colors ?? {}),
      'editor.background': '#000000'
    }
  }
  const highlighter = await createHighlighterCore({
    engine: createOnigurumaEngine(() => import('shiki/wasm')),
    langs: [shellsessionLang],
    themes: [modifiedTheme]
  })

  cachedHighlighter = highlighter

  return { pathname: url.pathname, shiki: highlighter }
}

injectAnalytics({
  beforeSend: (e) => window.localStorage.getItem(DENY_ANALYTICS) === 'true' ? null : e,
  mode: dev ? 'development' : 'production'
})
