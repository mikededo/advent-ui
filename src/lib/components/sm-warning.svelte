<script lang="ts">
    import Banner from './banner.svelte';

    type Props = {
      notImplemented: boolean;
    };
    const { notImplemented }: Props = $props();
</script>

<Banner class="md:hidden" header="Small device detected!">
    While I've tried to make an effort to make the visualization of this
    problem as responsive as possible, I stronhly recommend viewing this
    visualization in larger screens, or in horizontal mode!
</Banner>

{#if notImplemented}
    <Banner class="mt-4 rounded-md md:hidden" variant="destructive">
        This visualization is not adapted to small devices and the output may
        not be correctly visualized.
    </Banner>
{/if}
