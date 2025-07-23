<script lang="ts">
  export let options: string[] = [];
  export let value: string = "";

  let open = false;
  $: selectedLabel = options.find((o) => o === value) ?? "";
</script>

<div class="select" class:open>
  <button on:click={() => (open = !open)}>
    {selectedLabel || "Select…"}
  </button>
  {#if open}
    <ul>
      {#each options as opt}
        <li
          on:click={() => {
            value = opt;
            open = false;
          }}
          class:active={opt === value}
        >
          {opt}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .select {
    position: relative;
    width: 100%;
    max-width: 240px;
  }
  button {
    width: 100%;
    text-align: left;
    padding: 0.5rem;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    cursor: pointer;
  }
  ul {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    background: white;
    border: 1px solid #d1d5db;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
  }
  li {
    padding: 0.5rem;
    cursor: pointer;
  }
  li.active,
  li:hover {
    background: #e5e7eb;
  }
</style>