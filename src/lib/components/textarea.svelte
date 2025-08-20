<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLTextareaAttributes } from 'svelte/elements';

    import { twMerge } from 'tailwind-merge';

    type Props = {
        class?: string;
        ref?: HTMLTextAreaElement;
        title?: string;
        options?: Snippet;
    } & HTMLTextareaAttributes;

    let {
        options,
        ref = $bindable(),
        title,
        value = $bindable(),
        ...restProps
    }: Props = $props();
    const classes = $derived(
        twMerge(
            'resize-none rounded-md border px-3 py-2 font-mono text-sm outline-hidden ring-2 ring-transparent ring-offset-1 transition-colors duration-150 hover:border-indigo hover:ring-indigo-100 hover:ring-offset-indigo-100 focus:border-indigo focus:ring-indigo-100 focus:ring-offset-indigo-100 md:px-3',
            restProps.class
        )
    );
</script>

<div class="flex items-center justify-between">
    <p class="m-0! font-semibold">{title}</p>
    {@render options?.()}
</div>
<textarea
    {...restProps}
    class={classes}
    bind:this={ref}
    bind:value
></textarea>
