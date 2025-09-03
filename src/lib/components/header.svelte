<script lang="ts">
    import type { Snippet } from 'svelte';

    import { MoveLeftIcon } from 'lucide-svelte';

    type Props = {
        fileName: string;
        title: string;
        url: string;
        description: Snippet;
        problemUrl: string;
        children?: Snippet;
    };

    const { children, description, fileName, problemUrl, title, url }: Props = $props();
</script>

<header>
    <nav class="flex">
        <a
            class="group mb-2 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 no-underline transition-colors hover:bg-slate-100 dark:hover:bg-slate-900"
            href="/"
        >
            <MoveLeftIcon class="size-4 transition-transform duration-100 ease-out group-active:-translate-x-1" strokeWidth={2} />
            <span>Go back</span>
        </a>
    </nav>
    <h1>{title}</h1>
    {@render description()}
    <ul>
        <li>
            Code for this solution:
            <a href={url}
                rel="external"
                target="_blank"
            >
                {fileName}
            </a>
        </li>
        <li><a href={problemUrl}>Problem statement</a></li>
    </ul>
    {#if children}
        {@render children()}
    {/if}
</header>
