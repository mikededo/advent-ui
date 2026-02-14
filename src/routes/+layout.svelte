<script lang="ts">
    import type { LayoutData } from './$types'

    import '../global.css'

    import type { Snippet } from 'svelte'

    import { setContext } from 'svelte'
    import { fade } from 'svelte/transition'
    import { tv } from 'tailwind-variants'

    import { page } from '$app/state'
    import { CookieConsent, VGRidLine } from '$lib/components'

    type Props = { children: Snippet, data: LayoutData }
    const { children, data }: Props = $props()

    setContext('shiki', data.shiki)

    const rootContainer = tv({
        variants: {
            isError: {
                true: 'my-auto'
            }
        }
    })
</script>

<main class="container relative flex min-h-[calc(100vh-48px)] flex-col overflow-hidden bg-white px-8 py-8">
    {#key data.pathname}
        <div
            class={rootContainer({ isError: Boolean(page.error) })}
            in:fade={{ duration: 250 }}
        >
            {@render children()}
        </div>
    {/key}

    <VGRidLine class="hidden lg:block" delay={0.15} />
    <VGRidLine class="hidden lg:block" delay={0.2} right />

    <CookieConsent />
</main>

<footer
    class="max-w-screen h-grid-line relative mt-auto flex h-12 w-auto items-center justify-center overflow-hidden bg-gray-50 text-sm"
>
    <p>
        Designed and developed by
        <a
            class="link"
            href="https://github.com/mikededo"
            rel="nofollow"
            target="_blank"
        >
            @mikededo
        </a>
        &centerdot;
        <a class="link"
            href="https://mikededo.com"
            rel="nofollow"
            target="_blank"
        >mikededo.com</a>
    </p>
</footer>
