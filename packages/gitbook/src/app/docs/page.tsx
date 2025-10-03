// packages/gitbook/src/app/docs/[[...path]]/page.tsx
export default async function DocsProxy({
  params,
  searchParams,
}: {
  params: { path?: string[] };
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const suffix = (params.path ?? []).join('/');

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp ?? {})) {
    if (Array.isArray(v)) v.forEach((it) => qs.append(k, String(it)));
    else if (v != null) qs.set(k, String(v));
  }

  const target =
    `/url/gitbook.com/docs` +
    (suffix ? `/${suffix}` : `/`) +
    (qs.toString() ? `?${qs}` : ``);

  return <DocsFrame initialSrc={target} />;
}

// import lazy di bawah supaya Next nggak ngira ini client component di server
import DocsFrame from './DocsFrame';
