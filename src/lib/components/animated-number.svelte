<script lang="ts">
    import { quadInOut } from 'svelte/easing';
    import { Tween } from 'svelte/motion';
    import { tv } from 'tailwind-variants';

    type Props = {
        value: number;
        class?: string;
        duration?: number;
        format?: (value: number) => number | string;
    };

    const {
        format = (value) => Math.round(value),
        value = 0,
        ...restProps
    }: Props = $props();
    const animatedValue = new Tween(value, { duration: 100, easing: quadInOut });

    const classes = tv({ base: 'animated-number inline-block font-bold' });

    $effect(() => {
        animatedValue.set(value);
    });
</script>

<span class={classes({ class: restProps.class })}>
    {format(animatedValue.current)}
</span>
