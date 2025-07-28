<script lang="ts">
    import type { Snippet } from 'svelte';

    import '../global.css';

    import type { LayoutData } from './$types';

    import { setContext } from 'svelte';
    import { fade } from 'svelte/transition';

    import { VGRidLine } from '$lib/components';

    type Props = { children: Snippet; data: LayoutData };
    const { children, data }: Props = $props();

    setContext('shiki', data.shiki);
</script>

<main
    class="container relative flex min-h-[calc(100vh-48px)] flex-col overflow-x-hidden bg-white px-8 py-8"
    style="scrollbar-gutter: auto;"
>
    {#key data.pathname}
        <div class="space-y-8 md:space-y-10" in:fade={{ delay: 100, duration: 100 }} out:fade={{ duration: 100 }}>
            {@render children()}
        </div>
    {/key}

    <VGRidLine class="hidden lg:block" delay={0.15} />
    <VGRidLine class="hidden lg:block" delay={0.2} right />
</main>

<footer
    class="max-w-screen h-grid-line relative mt-auto flex h-12 w-auto items-center justify-center overflow-hidden bg-gray-50 text-sm"
>
    <p>
        Designed and developed by
        <a
            href="https://github.com/mikededo"
            rel="external"
            target="_blank"
        >
            @mikededo
        </a>
    </p>
</footer>
