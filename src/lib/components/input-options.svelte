<script lang="ts">
    type Props = { large: string; small: string; onSelect: (value: string) => void };
    const { large, onSelect, small }: Props = $props();

    const onInputClick = (value: string) => () => {
        onSelect(value);
    };
</script>

<div class="flex items-center gap-4 text-sm font-medium">
    <button
        class="cursor-pointer hover:underline"
        onclick={onInputClick(small)}
    >
        Small input
    </button>
    <button
        class="cursor-pointer hover:underline"
        onclick={onInputClick(large)}
    >
        Large input
    </button>
</div>
