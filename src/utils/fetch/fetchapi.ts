import BaseApi from './commons/BaseApi';
import type { FetchOptions } from './commons/httpservice';
import apiConfig from './config/apiConfig';

interface TranscriptResponse {
  transcript: string;
}

export type AudioInput =
  | { type: 'base64'; data: string }
  | { type: 'float32array'; data: number[] | Float32Array }
  | { type: 'buffer'; data: ArrayBuffer };

class TranscriptApi extends BaseApi {
  constructor(config: any) {
    super(config);
  }

  private async sendAudio(
    endpoint: string,
    body?: any,
    buffer?: ArrayBuffer,
    options?: FetchOptions
  ): Promise<TranscriptResponse> {
    const url = `/transcript/${endpoint}`;

    if (buffer) {
      // Para /buffer, enviamos raw ArrayBuffer
      return this.post<TranscriptResponse>(url, buffer, {
        ...options,
        headers: {
          'Content-Type': 'application/octet-stream',
          ...options?.headers,
        },
      });
    } else {
      // Para /base64 y /float32array, enviamos JSON
      return this.post<TranscriptResponse>(url, body, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
    }
  }

  async transcribe(input: AudioInput, options?: FetchOptions): Promise<TranscriptResponse> {
    switch (input.type) {
      case 'base64':
        return this.sendAudio('base64', { audio: input.data }, undefined, options);

      case 'float32array': {
        const normalized = Array.isArray(input.data)
          ? input.data
          : Array.from(input.data); // Convierte Float32Array → number[]
        return this.sendAudio('float32array', { audio: normalized }, undefined, options);
      }

      case 'buffer':
        return this.sendAudio('buffer', undefined, input.data, options);

      default:
        throw new Error('Invalid audio input type');
    }
  }
}
const transcriptApi = new TranscriptApi(apiConfig);
class AssetsApi extends BaseApi {
  constructor(config: any) {
    super(config);
  }
}
/*
import TranscriptApi from './services/TranscriptApi';
import apiConfig from './config/apiConfig';


// Ejemplo con base64
await transcriptApi.transcribe({
  type: 'base64',
  data: 'base64string...',
});

// Ejemplo con Float32Array
await transcriptApi.transcribe({
  type: 'float32array',
  data: [0.1, -0.2, 0.3],
});

// Ejemplo con ArrayBuffer (desde archivo o micrófono)
const arrayBuffer = new ArrayBuffer(...);
await transcriptApi.transcribe({
  type: 'buffer',
  data: arrayBuffer,
});
*/
export {
  transcriptApi,
  TranscriptApi
}