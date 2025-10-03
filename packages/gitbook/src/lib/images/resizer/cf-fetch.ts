import { getLogger } from '@/lib/logger';
import type { CloudflareImageOptions } from './types';
import { copyImageResponse } from './utils';

export async function resizeImageWithCFFetch(
  input: string,
  options: CloudflareImageOptions & { signal?: AbortSignal }
): Promise<Response> {
  const { signal, ...resizeOptions } = options;

  const logger = getLogger().subLogger('imageResizing');
  logger.log(`resize image using cf-fetch: ${input}`);

  // ⬇️ Definisikan tipe init yang memperbolehkan 'cf'
  type CFRequestInit = RequestInit & {
    cf?: { image?: CloudflareImageOptions };
  };

  const init: CFRequestInit = {
    headers: {
      Accept:
        resizeOptions.format === 'json'
          ? 'application/json'
          : `image/${resizeOptions.format ?? 'jpeg'}`,
    },
    signal,
    cf: { image: resizeOptions },
  };

  const res = await fetch(input, init); // passing via variabel menghindari excess property check
  return copyImageResponse(res);
}
