<script lang="ts">
    import type { Snippet } from 'svelte'
    import type { Action } from 'svelte/action'

    import Textarea from './textarea.svelte'

    type Props = {
        leftTitle: string
        rightTitle: string
        leftPlaceholder: string
        rightPlaceholder: string
        leftRef?: HTMLTextAreaElement
        rightRef?: HTMLTextAreaElement
        leftOptions?: Snippet
        rightOptions?: Snippet
    }
    let {
        leftOptions,
        leftPlaceholder,
        leftRef = $bindable(),
        leftTitle,
        rightOptions,
        rightPlaceholder,
        rightRef = $bindable(),
        rightTitle
    }: Props = $props()

    let isDragging = $state(false)
    let draggablePosition = $state(50)
    const mapWidth = $derived(draggablePosition)

    let container: HTMLDivElement | undefined = $state()

    const useDraggable: Action<HTMLDivElement> = (node) => {
        node.addEventListener('mousedown', () => {
            isDragging = true
        })

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false
            }
        }

        const onMouseMove = (e: MouseEvent) => {
            if (isDragging && container) {
                const { width, x } = container.getBoundingClientRect()
                const relativeX = e.clientX - x
                draggablePosition = Math.min(Math.max((relativeX / width) * 100, 25), 75)
            }
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)

        return {
            destroy: () => {
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
            }
        }
    }
</script>

<div class="flex w-full flex-col items-center gap-2 md:flex-row" bind:this={container}>
    <div
        class="input flex flex-col gap-2"
        style="--input-width: {mapWidth}%"
        class:pointer-events-none={isDragging}
    >
        <Textarea
            bind:ref={leftRef}
            options={leftOptions}
            placeholder={leftPlaceholder}
            rows={10}
            title={leftTitle}
        />
    </div>
    <div
        class="hidden h-10 w-1 shrink-0 cursor-ew-resize bg-gray-200 md:block"
        use:useDraggable
    ></div>
    <div
        class="input col-span-2 flex flex-col gap-2"
        style="--input-width: {100 - mapWidth}%"
        class:pointer-events-none={isDragging}
    >
        <Textarea
            bind:ref={rightRef}
            options={rightOptions}
            placeholder={rightPlaceholder}
            rows={10}
            title={rightTitle}
        />
    </div>
</div>

<style lang="postcss">
@reference "tailwindcss";

.input {
  width: 100%;

  @media (width >= theme(--breakpoint-md)) {
    width: var(--input-width);
  }
}
</style>
