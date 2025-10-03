// packages/gitbook/src/app/docs/[[...path]]/DocsFrame.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function urlToDocs(pathname: string) {
  // /url/gitbook.com/docs/abc → /docs/abc
  if (!pathname.startsWith('/url/gitbook.com/docs')) return null;
  const rest = pathname.slice('/url/gitbook.com/docs'.length) || '/';
  return '/docs' + (rest.startsWith('/') ? rest : `/${rest}`);
}

function docsToUrl(pathname: string) {
  // /docs/abc → /url/gitbook.com/docs/abc
  if (!pathname.startsWith('/docs')) return null;
  const rest = pathname.slice('/docs'.length) || '/';
  return '/url/gitbook.com/docs' + (rest.startsWith('/') ? rest : `/${rest}`);
}

export default function DocsFrame({ initialSrc }: { initialSrc: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // sync: iframe → parent (update address bar ke /docs/...)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const syncFromIframe = () => {
      try {
        const win = iframe.contentWindow;
        if (!win) return;
        const { pathname: p, search } = win.location;
        const docsPath = urlToDocs(p);
        if (!docsPath) return;

        const current = pathname + (searchParams?.toString() ? `?${searchParams}` : '');
        const next = docsPath + (search ?? '');
        if (next !== current) {
          // ganti URL parent tanpa reload
          window.history.pushState({}, '', next);
        }
      } catch {
        // beda origin? harusnya sama-origin, jadi diabaikan saja kalau error
      }
    };

    // pertama kali & tiap load navigasi iframe
    const onLoad = () => syncFromIframe();
    iframe.addEventListener('load', onLoad);
    // juga coba sync awal
    syncFromIframe();

    return () => {
      iframe.removeEventListener('load', onLoad);
    };
  }, [pathname, searchParams]);

  // sync: parent → iframe (navigasi via back/forward atau manual ganti URL ke /docs/...)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const desiredUrlPath = docsToUrl(pathname);
    if (!desiredUrlPath) return;

    const qs = searchParams?.toString() ? `?${searchParams}` : '';
    const desired = desiredUrlPath + qs;

    try {
      const win = iframe.contentWindow;
      if (!win) {
        iframe.src = desired; // fallback
        return;
      }
      const current = win.location.pathname + win.location.search;
      if (current !== desired) {
        // arahkan iframe ke rute /url/... yang matching parent
        win.location.replace(desired);
      }
    } catch {
      // kalau ada masalah, set langsung src
      iframe.src = desired;
    }
  }, [pathname, searchParams]);

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <iframe
        ref={iframeRef}
        src={initialSrc}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}
