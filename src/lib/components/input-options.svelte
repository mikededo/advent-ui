<script lang="ts">
    import { LoaderCircle } from 'lucide-svelte';
    import { fade } from 'svelte/transition';
    import { twMerge } from 'tailwind-merge';

    type Props = ({
        /**
         * Use only when the value is handled from outside the component
         */
        empty: true;
        large?: never;
        small?: never;
    } | {
        large: string;
        small: string;
        empty?: false;
    }) & {
        onSelect: (value: string, type: 'large' | 'small') => void;
        class?: string;
        loading?: boolean;

    };
    const { empty, large, loading, onSelect, small, ...rest }: Props = $props();

    const onInputClick = (valueType: 'large' | 'small') => () => {
        onSelect(empty ? '' : valueType === 'large' ? large : small, valueType);
    };
</script>

<div class={twMerge('flex items-center gap-4 text-sm font-medium', rest.class)}>
    {#if loading}
        <span transition:fade={{ duration: 150 }}>
            <LoaderCircle class="-mr-2 size-3 animate-spin text-gray-600" />
        </span>
    {/if}
    <button
        class="cursor-pointer hover:underline disabled:pointer-events-none disabled:text-gray-500"
        disabled={loading}
        onclick={onInputClick('small')}
    >
        Small input
    </button>
    <button
        class="cursor-pointer hover:underline disabled:pointer-events-none disabled:text-gray-500"
        disabled={loading}
        onclick={onInputClick('large')}
    >
        Large input
    </button>
</div>
