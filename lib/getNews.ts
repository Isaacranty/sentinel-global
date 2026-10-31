import Parser from "rss-parser";
import { FEED_SOURCES, NewsItem } from "./feeds";

const parser = new Parser();

export async function getNews(): Promise<{
  items: NewsItem[];
  failedSources: string[];
}> {
  const results = await Promise.allSettled(
    FEED_SOURCES.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return (feed.items || []).slice(0, 8).map(
        (item): NewsItem => ({
          sourceId: source.id,
          sourceName: source.name,
          category: source.category,
          title: item.title || "(untitled)",
          link: item.link || "#",
          isoDate: item.isoDate || new Date().toISOString(),
          contentSnippet: (item.contentSnippet || "").slice(0, 220),
        })
      );
    })
  );

  const items = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());

  const failedSources = results
    .map((r, i) => (r.status === "rejected" ? FEED_SOURCES[i].name : null))
    .filter((v): v is string => Boolean(v));

  return { items, failedSources };
}
