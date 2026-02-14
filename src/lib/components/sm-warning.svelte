<script lang="ts">
    import { twMerge } from 'tailwind-merge'

    import Banner from './banner.svelte'

    type Props = {
        notImplemented: boolean
        class?: string
        mainClass?: string
        notImplementedClass?: string
    } & { notImplemented: true, recommendedMinWidth?: number }
    const { notImplemented, recommendedMinWidth, ...restProps }: Props = $props()
</script>

<Banner class={twMerge('md:hidden border border-slate-200', !notImplemented && 'mb-4', restProps.class, restProps.mainClass)} header="Small device detected!">
    While I've tried to make an effort to make the visualization of this
    problem as responsive as possible, I strongly recommend viewing this
    visualization in larger screens, or in horizontal mode!
</Banner>

{#if notImplemented}
    <Banner class={twMerge('my-4 border border-red-200 md:hidden', restProps.class, restProps.notImplementedClass)} variant="destructive">
        This visualization is not adapted to small devices and the output may
        not be correctly visualized.
        {#if recommendedMinWidth}
            The recommended minimum width for this visualization is <span class="font-semibold">{recommendedMinWidth}px</span>.
        {/if}
    </Banner>
{/if}
