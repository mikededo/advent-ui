<script lang="ts">
    import { onMount } from 'svelte';

    import { page } from '$app/state';
    import { AnimatedNumber } from '$lib/components';

    let error = $state(0);

    onMount(() => {
        error = page.status;
    });
</script>

<svelte:head>
    <title>Oops - Not found</title>
</svelte:head>

<p class="font-mono text-6xl font-bold">
    <AnimatedNumber duration={1000} value={error} />
</p>
<h1 class="mb-0 text-2xl font-semibold">Oops, something went wrong</h1>
<p class="my-0!">Get back to the <a class="link" href="/">homepage</a>.</p>
