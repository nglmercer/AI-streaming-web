<script>
  export let name = "";
</script>

<div class="tab-panel" aria-label={name}>
  <slot />
</div>

<style>
  .tab-panel {
    padding: 1rem;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
</style>