<script lang="ts">
    import { expoOut } from 'svelte/easing';
    import { Tween } from 'svelte/motion';
    import { tv } from 'tailwind-variants';

    type Props = {
        value: number;
        class?: string;
        duration?: number;
        format?: (value: number) => number | string;
    };

    const {
        duration,
        format = (value) => Math.round(value),
        value = 0,
        ...restProps
    }: Props = $props();
    const animatedValue = new Tween(value, {
        duration: duration ?? 100,
        easing: expoOut
    });

    const classes = tv({ base: 'animated-number inline-block font-bold' });

    $effect(() => {
        animatedValue.set(value);
    });
</script>

<span class={classes({ class: restProps.class })}>
    {format(animatedValue.current)}
</span>
