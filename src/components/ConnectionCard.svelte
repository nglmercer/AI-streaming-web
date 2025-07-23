<!-- src/lib/components/ConnectionCard.svelte -->
<script lang="ts">
	import type { ConnectionState } from '../lib/types';
	import { createEventDispatcher } from 'svelte';

	export let connection: ConnectionState;
	export let isSelected = false;

	const dispatch = createEventDispatcher();

	function handleConnect() {
		dispatch('connect', connection.id);
	}
	function handleDisconnect() {
		dispatch('disconnect', connection.id);
	}
	function handleRemove() {
		if (confirm(`¿Seguro que quieres eliminar la conexión "${connection.name || connection.id}"?`)) {
			dispatch('remove', connection.id);
		}
	}
	function handleSelect() {
		dispatch('select', connection.id);
	}

	$: isConnectable = connection.status === 'disconnected' || connection.status === 'error';
	$: isDisconnectable = connection.status === 'connected' || connection.status === 'connecting';
</script>

<article class="card" class:selected={isSelected} on:click={handleSelect}>
	<header>
		<div class="status-indicator {connection.status}" title={connection.status} />
		<div class="info">
			<strong class="name">{connection.name || connection.id}</strong>
			<span class="url">{connection.url}</span>
		</div>
	</header>
	<footer>
		{#if isConnectable}
			<button class="action-btn connect" on:click|stopPropagation={handleConnect}>Conectar</button>
		{/if}
		{#if isDisconnectable}
			<button class="action-btn disconnect" on:click|stopPropagation={handleDisconnect}>Desconectar</button>
		{/if}
		<button class="action-btn remove" on:click|stopPropagation={handleRemove}>×</button>
	</footer>
</article>

<style>
	.card {
		background-color: #333;
		border: 1px solid #555;
		border-radius: 8px;
		padding: 1rem;
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	.card:hover {
		background-color: #3a3a3a;
	}
	.card.selected {
		border-color: #007acc;
		background-color: #38404a;
	}

	header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.info {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.name {
		font-size: 1.1rem;
		color: #f1f1f1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.url {
		font-size: 0.8rem;
		color: #aaa;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.status-indicator.disconnected {
		background-color: #888;
	}
	.status-indicator.connecting {
		background-color: #f39c12;
		animation: pulse 1.5s infinite;
	}
	.status-indicator.connected {
		background-color: #2ecc71;
	}
	.status-indicator.error {
		background-color: #e74c3c;
	}

	footer {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	.action-btn {
		padding: 0.3rem 0.8rem;
		border-radius: 4px;
		border: none;
		color: white;
		cursor: pointer;
		font-size: 0.8rem;
	}
	.connect {
		background-color: #27ae60;
	}
	.disconnect {
		background-color: #c0392b;
	}
	.remove {
		background-color: #7f8c8d;
		font-weight: bold;
	}

	@keyframes pulse {
		0% {
			transform: scale(0.9);
			opacity: 0.7;
		}
		50% {
			transform: scale(1.1);
			opacity: 1;
		}
		100% {
			transform: scale(0.9);
			opacity: 0.7;
		}
	}
</style>