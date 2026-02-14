<script lang="ts">
    import type { SliderRootProps } from 'bits-ui'

    import { Slider } from 'bits-ui'

    type Props = { label?: string } & Pick<SliderRootProps, 'max' | 'min' | 'step' | 'value'>
    let { label, value = $bindable(), ...rootProps }: Props = $props()
</script>

<Slider.Root
    class="relative flex h-6 w-full touch-none select-none items-center"
    bind:value={value as never}
    type="single"
    {...rootProps}
>

    <span
        class="relative h-2 w-full grow cursor-pointer overflow-hidden bg-slate-200"
    >
        <Slider.Range class="bg-foreground absolute h-full" />
    </span>
    <Slider.Thumb
        class="focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 focus-visible:outline-hidden data-active:scale-[0.98] block size-5 cursor-pointer border bg-white shadow-sm transition-colors hover:border-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        index={0}
    />
    {#if label}
        <Slider.ThumbLabel
            class="text-foreground mb-0.5 text-nowrap bg-slate-50 px-2 py-1 text-sm"
            index={0}
            position="top"
        >
            {label}
        </Slider.ThumbLabel>
    {/if}
</Slider.Root>

