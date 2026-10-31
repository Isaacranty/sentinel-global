export type FeedSource = {
  id: string;
  name: string;
  url: string;
  category: "breach" | "vuln" | "malware" | "general";
};

// Add or remove sources here — the aggregator loops over this list.
export const FEED_SOURCES: FeedSource[] = [
  {
    id: "krebs",
    name: "Krebs on Security",
    url: "https://krebsonsecurity.com/feed/",
    category: "breach",
  },
  {
    id: "hackernews",
    name: "The Hacker News",
    url: "https://feeds.feedburner.com/TheHackersNews",
    category: "general",
  },
  {
    id: "bleepingcomputer",
    name: "BleepingComputer",
    url: "https://www.bleepingcomputer.com/feed/",
    category: "malware",
  },
  {
    id: "cisa",
    name: "CISA Advisories",
    url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    category: "vuln",
  },
  {
    id: "therecord",
    name: "The Record",
    url: "https://therecord.media/feed/",
    category: "general",
  },
];

export type NewsItem = {
  sourceId: string;
  sourceName: string;
  category: FeedSource["category"];
  title: string;
  link: string;
  isoDate: string;
  contentSnippet: string;
};
