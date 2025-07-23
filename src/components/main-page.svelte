<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { WsConnectionManager } from '../lib/WsConnectionManager';
	import type { ConnectionState, Message, ConnectionOptions } from '../lib/types';
	import ConnectionCard from './ConnectionCard.svelte';
	import ConnectionDetail from './ConnectionDetail.svelte';
	import { emitter } from '../lib/Emitter';

	// --- Estado Reactivo ---

	// [CAMBIO 1]: Inicializar manager como null para un tipado estricto.
	// TypeScript sabe que podría no estar disponible fuera del ciclo de vida de onMount.
	let manager: WsConnectionManager | null = null;
	
	let connections: ConnectionState[] = [];
	let messages = new Map<string, Message[]>();
	let selectedConnectionId: string | null = null;
	
	// Derivados del estado (sin cambios, ya estaban bien)
	$: selectedConnection = connections.find(c => c.id === selectedConnectionId) || null;
	$: selectedConnectionMessages = (selectedConnectionId && messages.get(selectedConnectionId)) || [];

	const eventName = 'ws:create';

	// [CAMBIO 2]: Define el manejador del emitter fuera de onMount para poder
	// removerlo correctamente en la fase de limpieza.
	const handleEmitterCreate = (data: ConnectionOptions) => {
		// El chequeo de null es una buena práctica ahora que el tipo lo permite.
		if (manager) {
			handleCreate(data);
		}
	};

	onMount(() => {
		manager = new WsConnectionManager();

		// --- Suscribirse a eventos del Manager ---
		// Los tipos aquí ya estaban bien, ¡excelente!
		manager.on('connectionCreated', (state: ConnectionState) => {
			connections = [...connections, state];
			messages.set(state.id, []);
			selectedConnectionId = state.id;
		});

		manager.on('connectionRemoved', (id: string) => {
			connections = connections.filter((c) => c.id !== id);
			messages.delete(id);
			if (selectedConnectionId === id) {
				selectedConnectionId = null;
			}
		});

		manager.on('connectionStatusChange', (state: ConnectionState) => {
			connections = connections.map((c) => (c.id === state.id ? state : c));
		});

		manager.on('message', (payload: { connectionId: string; message: Message }) => {
			const { connectionId, message } = payload;
			const currentMessages = messages.get(connectionId) || [];
			messages.set(connectionId, [...currentMessages, message]);
			messages = messages;
		});
		
		// [CAMBIO 3]: Usa el manejador predefinido y tipa su argumento.
		// Aunque ya lo tipamos en la definición de la función, esto muestra dónde iría el tipo.
		emitter.on(eventName, handleEmitterCreate);

		return () => {
			// Limpieza al desmontar el componente
			manager?.disconnectAll(); // El operador 'optional chaining' es útil aquí.
			
			// [CAMBIO 4]: Pasa la referencia de función correcta a .off()
			emitter.off(eventName, handleEmitterCreate);
		}
	});

	// --- Handlers de Eventos de Componentes Hijos ---
	function handleCreate(options: ConnectionOptions) {
		try {
			// El chequeo de null asegura que no se llame si el manager no está listo.
			manager?.createConnection(options);
		} catch (e) {
			console.error("Error al crear la conexión:", e);
		}
	}

	// [CAMBIO 5]: Tipar explícitamente los eventos de los componentes hijos.
	// El payload (el ID) viene en `event.detail`.
	
	function handleConnect(event: CustomEvent<string>) {
		const id = event.detail;
		manager?.connect(id);
	}

	function handleDisconnect(event: CustomEvent<string>) {
		const id = event.detail;
		manager?.disconnect(id);
	}

	function handleRemove(event: CustomEvent<string>) {
		const id = event.detail;
		manager?.removeConnection(id);
	}

	function handleSelect(event: CustomEvent<string>) {
		selectedConnectionId = event.detail;
	}
	
	function handleSend(event: CustomEvent<string | object>) {
		const data = event.detail;
		if (selectedConnectionId) {
			manager?.send(selectedConnectionId, data);
		}
	}

</script>

<!-- El resto de tu componente (HTML y CSS) permanece igual -->
<main>	
	<div class="slot">
		<slot></slot>
	</div>

	<div class="layout">
		<aside class="connection-list">
			<h2>Conexiones</h2>
			{#if connections.length === 0}
				<p class="no-connections">No hay conexiones. ¡Crea una!</p>
			{:else}
				{#each connections as conn (conn.id)}
					<ConnectionCard
						connection={conn}
						isSelected={conn.id === selectedConnectionId}
						on:connect={handleConnect}
						on:disconnect={handleDisconnect}
						on:remove={handleRemove}
						on:select={handleSelect}
					/>
				{/each}
			{/if}
		</aside>

		<section class="detail-view">
			{#if selectedConnection}
				<ConnectionDetail 
					connection={selectedConnection}
					messages={selectedConnectionMessages}
					on:send={handleSend}
				/>
			{:else}
				<div class="placeholder">
					<p>Selecciona una conexión para ver sus detalles y mensajes.</p>
				</div>
			{/if}
		</section>
	</div>
</main>

<style>
	main {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem;
	}
	.layout {
		display: grid;
		grid-template-columns: 350px 1fr;
		gap: 1.5rem;
		height: 70vh;
	}
	.connection-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		overflow-y: auto;
		padding-right: 10px;
	}
	.no-connections {
		color: #888;
		text-align: center;
		margin-top: 1rem;
	}
	.detail-view {
		height: 100%;
	}
	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		border: 2px dashed #444;
		border-radius: 8px;
		color: #888;
	}
</style>