<script lang="ts" module>
    export const DENY_ANALYTICS = 'advent-ui:deny-analytics';
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import { quintOut } from 'svelte/easing';
    import { fly, slide } from 'svelte/transition';

    import Button from './button.svelte';

    let show = $state(false);
    let knowMore = $state(false);

    onMount(() => {
        if (!window.localStorage) {
            return;
        }

        show = window.localStorage.getItem(DENY_ANALYTICS) === null;
    });

    const onDeny = () => {
        if (window.localStorage) {
            window.localStorage.setItem(DENY_ANALYTICS, 'true');
        }
        show = false;
    };

    const onAccept = () => {
        if (window.localStorage) {
            window.localStorage.setItem(DENY_ANALYTICS, 'false');
        }

        show = false;
    };

    const onKnowMore = () => {
        knowMore = !knowMore;
    };
</script>

{#if show}
    <div
        class="fixed bottom-2 left-2 right-2 z-50 border border-slate-200 bg-white p-3 text-sm sm:left-auto sm:right-0 sm:max-w-sm"
        transition:fly={{ easing: quintOut, y: 28 }}
    >
        <p class="mt-0">
            This site uses tracking technologies. You may opt in or opt out of the use of these technologies.
        </p>
        {#if knowMore}
            <div class="py-1">
                <hr />
            </div>
            <p
                class="origin-bottom"
                style="scrollbar-gutter: auto"
                transition:slide={{ easing: quintOut }}
            >
                The site does not track any personal information nor any sensitive data! It only tracks <strong>page visits</strong>, and other things that can help me provide a better experience to the site! Since I'm using Vercel's integrated tracking, check:
                <a class="link" href="https://vercel.com/docs/analytics/privacy-policy#privacy-and-compliance">Vercel's conditions</a>.
                You can completely opt out of analytics without being able to use the site at it's 100%!
            </p>
        {/if}
        <div class="flex justify-end gap-2">
            <Button class="mr-auto normal-case" variant="secondary" onclick={onKnowMore}>
                {knowMore ? 'Close' : 'Know more'}
            </Button>
            <Button class="normal-case" variant="secondary" onclick={onDeny}>
                Deny
            </Button>
            <Button class="normal-case" onclick={onAccept}>Accept</Button>
        </div>
    </div>
{/if}
