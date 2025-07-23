<script lang="ts">
  export let value: number = 0;
  export let min: number = 0;
  export let max: number = Infinity;
  export let step: number = 1;

  function inc() {
    value = Math.min(value + step, max);
  }
  function dec() {
    value = Math.max(value - step, min);
  }
</script>

<div class="number-input">
  <button on:click={dec}>−</button>
  <input type="number" bind:value {min} {max} {step} />
  <button on:click={inc}>+</button>
</div>

<style>
  .number-input {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  button {
    width: 28px;
    height: 28px;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    cursor: pointer;
  }
  input {
    width: 60px;
    text-align: center;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
  }
</style>