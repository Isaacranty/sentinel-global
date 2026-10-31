import { getNews } from "../lib/getNews";
import { readThreads } from "../lib/threadsStore";
import { prisma } from "../lib/prisma";

async function generateBrief() {
  console.log("[daily-brief] Generating daily intelligence brief...");

  const { items: news } = await getNews();
  const trendingThreads = await readThreads(undefined, "trending");

  const topNews = news.slice(0, 5).map(i => ({
      title: i.title,
      link: i.link,
      sourceName: i.sourceName,
      category: i.category,
      contentSnippet: i.contentSnippet
  }));

  const topThreads = trendingThreads.slice(0, 5).map(t => ({
      id: t.id,
      title: t.title,
      authorName: t.authorName,
      repliesCount: t.replies.length,
      verified: t.verified,
      body: t.body.slice(0, 200)
  }));

  const data = { topNews, topThreads };

  await prisma.dailyBrief.upsert({
    where: { date: new Date(new Date().setHours(0, 0, 0, 0)) },
    update: { content: JSON.stringify(data) },
    create: {
        date: new Date(new Date().setHours(0, 0, 0, 0)),
        content: JSON.stringify(data)
    },
  });

  console.log(`[daily-brief] Brief saved to database for today.`);
}

generateBrief().catch(err => {
  console.error("[daily-brief] Failed to generate brief:", err);
  process.exit(1);
});
