<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements'
    import type { VariantProps } from 'tailwind-variants'

    import { tv } from 'tailwind-variants'

    type Props = {
        class?: string
        variant?: VariantProps<typeof classes>['variant']
    } & HTMLButtonAttributes

    const { variant, ...rest }: Props = $props()

    const classes = tv({
        base: 'cursor-pointer px-4 py-2 text-sm font-medium uppercase transition-colors duration-150 active:scale-[0.975] disabled:cursor-not-allowed disabled:bg-gray-500',
        defaultVariants: { variant: 'default' },
        variants: {
            variant: {
                default: 'bg-gray-700 text-slate-100 hover:bg-slate-600',
                secondary: 'bg-slate-100 hover:bg-slate-200'
            }
        }
    })
</script>

<button {...rest} class={classes({ className: rest?.class, variant })}>
    {@render rest.children?.()}
</button>
