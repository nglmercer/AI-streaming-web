<script lang="ts">
  export let tabs: string[] = [];
  let active = 0;
</script>

<div data-scope="tabs" data-part="root">
  <div data-scope="tabs" data-part="list" role="tablist">
    {#each tabs as tab, idx}
      <button
        role="tab"
        class:chakra-tabs__trigger--active={idx === active}
        on:click={() => (active = idx)}
      >
        {tab}
      </button>
    {/each}
  </div>

  <div data-scope="tabs" data-part="content-group">
    {#each tabs as tab, idx}
      <div
        role="tabpanel"
        hidden={idx !== active}
      >
        <slot />
      </div>
    {/each}
  </div>
</div>