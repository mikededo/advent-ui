<script lang="ts">
    import { onMount } from 'svelte';

    const DOTS = ['.', '..', '...'];

    let text = $state('');

    onMount(() => {
        let index = 0;

        const interval = setInterval(() => {
            text = DOTS[index];
            index = (index + 1) % DOTS.length;
        }, 250);

        return () => {
            clearInterval(interval);
        };
    });
</script>

<span>{text}</span>
