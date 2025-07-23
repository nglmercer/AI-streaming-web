<!-- src/lib/components/ConnectionDetail.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { ConnectionState, Message } from '../lib/types';
	import { slide } from 'svelte/transition';

	export let connection: ConnectionState;
	export let messages: Message[] = [];

	const dispatch = createEventDispatcher<{ send: string | object }>();
	let messageToSend = '';
	let messageLogEl: HTMLElement;

	$: isConnected = connection.status === 'connected';

	// Auto-scroll al final del log
	$: if (messageLogEl && messages) {
		messageLogEl.scrollTo({ top: messageLogEl.scrollHeight, behavior: 'smooth' });
	}

	function handleSend() {
		if (!messageToSend.trim() || !isConnected) return;

		let data: string | object = messageToSend;
		try {
			// Intenta parsear como JSON para enviar objetos
			data = JSON.parse(messageToSend);
		} catch (e) {
			// Si no es JSON válido, enviar como string
		}
		dispatch('send', data);
		messageToSend = '';
	}
</script>

<div class="detail-container">
	<h3>Log de: {connection.name || connection.id}</h3>

	<div class="message-log" bind:this={messageLogEl}>
		{#if messages.length === 0}
			<p class="empty-log">Aún no hay mensajes. Conéctate y envía algo.</p>
		{:else}
			{#each messages as msg (msg.id)}
				<div class="message {msg.type}" transition:slide|local>
					<span class="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
					<pre>{typeof msg.data === 'object' ? JSON.stringify(msg.data, null, 2) : msg.data}</pre>
				</div>
			{/each}
		{/if}
	</div>

	<form class="send-form" on:submit|preventDefault={handleSend}>
		<textarea
			bind:value={messageToSend}
			placeholder={isConnected ? 'Escribe un mensaje (JSON o texto)...' : 'Conéctate para enviar mensajes'}
			disabled={!isConnected}
			on:keydown={(e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					handleSend();
				}
			}}
		></textarea>
		<button type="submit" disabled={!isConnected || !messageToSend.trim()}>Enviar</button>
	</form>
</div>

<style>
	.detail-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #2c2c2c;
		border-radius: 8px;
		overflow: hidden;
	}
	h3 {
		padding: 1rem;
		margin: 0;
		background: #333;
		border-bottom: 1px solid #444;
	}
	.message-log {
		flex-grow: 1;
		padding: 1rem;
		overflow-y: auto;
        max-height: 100dvh;
	}
	.empty-log {
		color: #888;
		text-align: center;
		margin-top: 2rem;
	}

	.message {
		padding: 0.5rem 1rem;
		border-radius: 8px;
		margin-bottom: 0.5rem;
		max-width: 80%;
		word-wrap: break-word;
	}
	.message pre {
		white-space: pre-wrap;
		margin: 0;
		font-family: 'Courier New', Courier, monospace;
	}
	.message.sent {
		background: #007acc;
		color: white;
		margin-left: auto;
		text-align: right;
	}
	.message.received {
		background: #4a4a4a;
		color: #f1f1f1;
		margin-right: auto;
	}
	.timestamp {
		display: block;
		font-size: 0.7rem;
		opacity: 0.7;
		margin-bottom: 0.25rem;
	}

	.send-form {
		display: flex;
		padding: 1rem;
		border-top: 1px solid #444;
		gap: 1rem;
	}
	textarea {
		flex-grow: 1;
		background: #333;
		border: 1px solid #555;
		color: #eee;
		border-radius: 4px;
		padding: 0.5rem;
		resize: vertical;
		min-height: 40px;
	}
	button {
		padding: 0 1.5rem;
		background: #27ae60;
		border: none;
		border-radius: 4px;
		color: white;
		cursor: pointer;
	}
	button:disabled {
		background: #555;
		cursor: not-allowed;
	}
</style>