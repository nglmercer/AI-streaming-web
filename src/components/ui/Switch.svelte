<script lang="ts">
  export let checked: boolean = false;
  export let label: string = "";
</script>

<label class="switch">
  <input type="checkbox" bind:checked />
  <span class="slider" />
  {label}
</label>

<style>
  .switch {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
  }
  .switch input {
    display: none;
  }
  .slider {
    position: relative;
    width: 44px;
    height: 24px;
    background: #ccc;
    border-radius: 24px;
    transition: 0.2s;
  }
  .slider::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: 0.2s;
  }
  .switch input:checked + .slider {
    background: #4ade80;
  }
  .switch input:checked + .slider::after {
    transform: translateX(20px);
  }
</style>