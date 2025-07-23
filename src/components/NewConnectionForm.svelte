<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { ConnectionOptions } from '../lib/types';
	
	const dispatch = createEventDispatcher<{ create: ConnectionOptions }>();
	
	let id = `conn-${Math.random().toString(36).substring(2, 7)}`;
	let name = 'Mi Conexión de Prueba';
	let url = 'wss://socketsbay.com/wss/v2/1/demo/';

	function handleSubmit() {
		// No necesitas preventDefault aquí, el modificador lo maneja
		if (!id || !url) {
			console.error('El ID y la URL son obligatorios.');
			return;
		}
		
		console.log('Despachando evento create con:', { id, url, name: name || undefined });
		dispatch('create', { id, url, name: name || undefined });
		
		// Resetear campos
		id = `conn-${Math.random().toString(36).substring(2, 7)}`;
		name = '';
		url = '';
	}
</script>


<!-- LA LÍNEA CLAVE ESTÁ AQUÍ -->
<form on:submit|preventDefault={handleSubmit} class="form-container">
	<h3>Crear Nueva Conexión</h3>
	<div class="form-grid">
		<label for="conn-id">ID Único</label>
		<input type="text" id="conn-id" bind:value={id} required />

		<label for="conn-name">Nombre (Opcional)</label>
		<input type="text" id="conn-name" bind:value={name} placeholder="Ej: Servidor de Chat" />

		<label for="conn-url">URL del WebSocket</label>
		<input type="url" id="conn-url" bind:value={url} required placeholder="wss://..." />
	</div>
	<button type="submit">Crear Conexión</button>
</form>

<style>
	/* ... tus estilos permanecen igual ... */
	.form-container {
		padding: 1rem;
		border: 1px solid #444;
		border-radius: 8px;
		background-color: #2a2a2a;
		margin-bottom: 1.5rem;
	}
	.form-grid {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.8rem;
		align-items: center;
		margin-bottom: 1rem;
	}
	label {
		font-weight: bold;
		text-align: right;
	}
	input {
		padding: 0.5rem;
		background-color: #333;
		border: 1px solid #555;
		border-radius: 4px;
		color: #eee;
	}
	button {
		width: 100%;
		padding: 0.7rem;
		background-color: #007acc;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
	}
	button:hover {
		background-color: #005f9e;
	}
</style>