<script lang="ts">
    import './shiki-code.css'

    import type { BuiltinLanguage, CodeToHastOptions, Highlighter } from 'shiki'

    import { getContext } from 'svelte'

    type ShikiLanguage = ({} & string) | BuiltinLanguage
    type ShikiOptions = {
        lang: ShikiLanguage
    } & Omit<CodeToHastOptions<string, string>, 'defaultColor' | 'lang' | 'themes'>

    type Props = {
        code: string
        options: ShikiOptions
    }
    const { code, options }: Props = $props()
    const highlighter = getContext<Highlighter>('shiki')

    const renderCode = () => highlighter.codeToHtml(code.trim(), {
        ...options,
        defaultColor: false,
        themes: { light: 'github-light-default' }
    } satisfies CodeToHastOptions<string, string>)
</script>

<div class="shiki-wrapper my-4 px-5 py-3 text-sm">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html renderCode()}
</div>
