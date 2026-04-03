/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

/** Maximum HTML response size (1 MB) to prevent unbounded memory usage. */
const MAX_HTML_SIZE = 1_000_000;

/**
 * Fetches a URL and extracts OpenGraph meta tags using Cloudflare's HTMLRewriter.
 * Streams the response so only the tag attributes are stored in memory.
 */
export async function fetchOpenGraphTags(url: string): Promise<Record<string, string>> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });

  const tags: Record<string, string> = {};

  const handler: HTMLRewriterElementContentHandlers = {
    element(el) {
      const property = el.getAttribute('property') ?? el.getAttribute('name');
      const content = el.getAttribute('content');
      if (property && content && !tags[property]) {
        tags[property] = content;
      }
    },
  };

  await new HTMLRewriter()
    .on('meta[property^="og:"]', handler)
    .on('meta[name^="og:"]', handler)
    .transform(response)
    .arrayBuffer();

  return tags;
}

/**
 * Fetches a URL with a browser-like User-Agent and returns the HTML body.
 * Response is capped at {@link MAX_HTML_SIZE} to guard against unbounded memory usage.
 */
export async function fetchPageHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });
  const text = await response.text();
  return text.slice(0, MAX_HTML_SIZE);
}
