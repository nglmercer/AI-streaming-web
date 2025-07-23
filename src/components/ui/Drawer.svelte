<script lang="ts">
  export let open = false;
  export let title = "";
</script>

{#if open}
  <div
    role="dialog"
    aria-modal="true"
    class="chakra-drawer__backdrop"
    on:click={() => (open = false)}
  >
    <div
      class="chakra-drawer__content css-196561j"
      on:click|stopPropagation
    >
      <header class="chakra-drawer__header css-1a9yt63">
        <h2 class="chakra-drawer__title">{title}</h2>
        <button
          aria-label="Close"
          class="chakra-drawer__closeTrigger"
          on:click={() => (open = false)}
        >
          ✕
        </button>
      </header>

      <div class="chakra-drawer__body">
        <slot />
      </div>

      <footer class="chakra-drawer__footer">
        <button on:click={() => (open = false)}>Cancel</button>
        <button>Save</button>
      </footer>
    </div>
  </div>
{/if}