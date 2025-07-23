<script lang="ts">
  import Drawer from './ui/Drawer.svelte';
  import Tabs from './ui/Tabs.svelte';
  import TabPanel from './ui/TabPanel.svelte';
  import Switch from './ui/Switch.svelte';
  import Select from './ui/Select.svelte';
  import NumberInput from './ui/NumberInput.svelte';

  let open = true;
</script>

<Drawer bind:open title="Settings">
  <!-- Tabs -->
  <Tabs
    tabs={['General', 'Live2D', 'ASR', 'TTS', 'Agent', 'About']}
    
  >
    <!-- General -->
    <TabPanel name="General">
      <label class="block">
        <span class="block mb-1 text-sm font-medium">Language</span>
        <Select options={['English', '中文']} />
      </label>

      <label class="flex items-center justify-between">
        <span class="text-sm">Use Camera Background</span>
        <Switch />
      </label>

      <label class="flex items-center justify-between">
        <span class="text-sm">Show Subtitle</span>
        <Switch checked />
      </label>

      <label class="block">
        <span class="block mb-1 text-sm font-medium">Background Image</span>
        <Select
          options={[
            '/bg/ceiling-window-room-night.jpeg',
            '/bg/cityscape.jpeg',
            /* … */
          ]}
        />
      </label>

      <label class="block">
        <span class="block mb-1 text-sm font-medium">Custom Background URL</span>
        <input
          type="url"
          placeholder="Enter image URL"
          class="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-sky-500"
        />
      </label>

      <label class="block">
        <span class="block mb-1 text-sm font-medium">Character Preset</span>
        <Select options={['shizuku-local', 'mashiro', 'unhelpful_ai']} />
      </label>

      <label class="block">
        <span class="block mb-1 text-sm font-medium">WebSocket URL</span>
        <input
          type="text"
          value="ws://127.0.0.1:12393/client-ws"
          class="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-sky-500"
        />
      </label>

      <label class="block">
        <span class="block mb-1 text-sm font-medium">Base URL</span>
        <input
          type="url"
          value="http://127.0.0.1:12393"
          class="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-sky-500"
        />
      </label>
    </TabPanel>

    <!-- Live2D -->
    <TabPanel name="Live2D">
      <label class="flex items-center justify-between">
        <span class="text-sm">Pointer Interactive</span>
        <Switch />
      </label>
      <label class="flex items-center justify-between">
        <span class="text-sm">Enable Scroll to Resize</span>
        <Switch checked />
      </label>
    </TabPanel>

    <!-- ASR -->
    <TabPanel name="ASR">
      <label class="flex items-center justify-between">
        <span class="text-sm">Auto Stop Mic When AI Starts Speaking</span>
        <Switch checked />
      </label>
      <label class="flex items-center justify-between">
        <span class="text-sm">Auto Start Mic When Conversation Ends</span>
        <Switch />
      </label>
      <label class="flex items-center justify-between">
        <span class="text-sm">Auto Start Mic When AI Interrupted</span>
        <Switch />
      </label>

      <label class="flex items-center justify-between">
        <span class="text-sm">Speech Prob Threshold</span>
        <NumberInput value={50} min={1} max={100} />
      </label>

      <label class="flex items-center justify-between">
        <span class="text-sm">Negative Speech Threshold</span>
        <NumberInput value={35} min={0} max={100} />
      </label>

      <label class="flex items-center justify-between">
        <span class="text-sm">Redemption Frames</span>
        <NumberInput value={35} min={1} max={100} />
      </label>
    </TabPanel>

    <TabPanel name="TTS">
      <!-- Aquí va el contenido de TTS -->
      <p class="text-sm text-slate-400">TTS Settings Content</p>
    </TabPanel>

    <TabPanel name="Agent">
      <label class="flex items-center justify-between">
        <span class="text-sm">Allow AI to Speak Proactively</span>
        <Switch />
      </label>
      <label class="flex items-center justify-between">
        <span class="text-sm">Prompt AI via Raise-Hand Button</span>
        <Switch />
      </label>
    </TabPanel>

    <TabPanel name="About">
      <p class="text-sm text-slate-400">About Settings Content</p>
    </TabPanel>
  </Tabs>
</Drawer>