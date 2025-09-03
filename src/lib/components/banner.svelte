<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import type { VariantProps } from 'tailwind-variants';

    import { tv } from 'tailwind-variants';

    type Props = {
        class?: string;
        header?: string;
        variant?: VariantProps<typeof variants>['variant'];
    } & HTMLAttributes<HTMLDivElement>;
    const { header, variant = 'default', ...rest }: Props = $props();

    const variants = tv({
        base: 'px-4 py-3 text-sm',
        defaultVariants: {
            variant: 'default'
        },
        variants: {
            variant: {
                default: 'bg-slate-100',
                destructive: 'bg-red-100 text-red-500',
                info: 'bg-blue-100 text-blue-500',
                positive: 'bg-green-100 text-green-500',
                warning: 'bg-orange-100 text-orange-500'
            }
        }
    });
</script>

<div class={variants({ class: rest.class, variant })}>
    {#if header}
        <span class="font-bold">{header}</span>
    {/if}
    {@render rest.children?.()}
</div>
