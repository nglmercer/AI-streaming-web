<script lang="ts">
  let isMuted = false;
  let isHandRaised = false;
  let message = '';

  function toggleMute() {
    isMuted = !isMuted;
  }

  function toggleHandRaise() {
    isHandRaised = !isHandRaised;
  }

  function handleFileAttach() {
    // Lógica para adjuntar archivo
    console.log('Attach file clicked');
  }

  function handleSendMessage() {
    if (message.trim()) {
      console.log('Sending message:', message);
      message = '';
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }
</script>

<div class="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md mx-auto">
  <!-- Header con controles de estado -->
  <div class="mb-4">
    <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3">
      <!-- Estado -->
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span class="text-sm font-medium text-gray-600">idle</span>
      </div>
      
      <!-- Botones de control -->
      <div class="flex items-center space-x-2">
        <button
          aria-label="mute"
          on:click={toggleMute}
          class="p-2 rounded-full transition-colors duration-200 {isMuted 
            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
        >
          {#if isMuted}
            <!-- Mic Off Icon -->
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 5.586l12.828 12.828M9 12a3 3 0 003 3m0 0a3 3 0 003-3m-3 3v3m0-9a3 3 0 00-3 3v3" />
            </svg>
          {:else}
            <!-- Mic On Icon -->
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
            </svg>
          {/if}
        </button>
        
        <button
          aria-label="raise hand"
          on:click={toggleHandRaise}
          class="p-2 rounded-full transition-colors duration-200 {isHandRaised 
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
        >
          <!-- Hand Icon -->
          <svg class="w-4 h-4 {isHandRaised ? 'fill-current' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Área de mensaje -->
  <div class="relative">
    <div class="flex items-end space-x-2 bg-gray-50 rounded-lg p-3">
      <!-- Botón adjuntar archivo -->
      <button
        aria-label="attach file"
        on:click={handleFileAttach}
        class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex-shrink-0"
      >
        <!-- Paperclip Icon -->
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>
      
      <!-- Textarea -->
      <div class="flex-1 relative">
        <textarea
          placeholder="Type your message..."
          rows="1"
          bind:value={message}
          on:keydown={handleKeydown}
          class="w-full resize-none bg-transparent border-none outline-none placeholder-gray-400 text-gray-700 text-sm leading-5 py-1 px-2 max-h-32 overflow-y-auto"
        ></textarea>
      </div>
      
      <!-- Botón enviar (aparece cuando hay texto) -->
      {#if message.trim()}
        <button
          aria-label="send message"
          on:click={handleSendMessage}
          class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex-shrink-0"
        >
          <!-- Send Icon -->
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Estilos adicionales para el textarea auto-resize */
  textarea {
    field-sizing: content;
  }
  
  /* Animación personalizada para el pulse */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>