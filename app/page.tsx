import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNews } from "@/lib/getNews";
import { getThreadsByUrls } from "@/lib/threadsStore";
import { LEARNING_PATHS } from "@/lib/learningPaths";
import NewsCard from "@/components/NewsCard";
import GlobalThreatSummary from "@/components/GlobalThreatSummary";
import LearningPathsPanel from "@/components/LearningPathsPanel";
import ActivityHeartbeat from "@/components/ActivityHeartbeat";
import NetworkTopology from "@/components/NetworkTopology";
import SiteHeader from "@/components/SiteHeader";
import SignalTicker from "@/components/SignalTicker";
import TerminalSearch from "@/components/TerminalSearch";

export default async function Home({ searchParams }: { searchParams: { q?: string, category?: string } }) {
  const session = await getServerSession(authOptions);
  const { items: allItems, failedSources } = await getNews();

  // Filter by search query and category
  let filteredItems = allItems;
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    filteredItems = filteredItems.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.contentSnippet.toLowerCase().includes(q)
    );
  }
  if (searchParams.category) {
    filteredItems = filteredItems.filter(item => item.category === searchParams.category);
  }

  const newsUrls = filteredItems.map(item => item.link);

  const [existingThreads, userBookmarks] = await Promise.all([
    getThreadsByUrls(newsUrls),
    session?.user?.id
      ? prisma.bookmark.findMany({ where: { userId: session.user.id } })
      : Promise.resolve([])
  ]);

  const bookmarkUrls = new Set(userBookmarks.map(b => b.newsUrl).filter(Boolean));
  const bookmarkThreadIds = new Set(userBookmarks.map(b => b.threadId).filter(Boolean));

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <SignalTicker items={allItems} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <TerminalSearch />

        <div className="grid md:grid-cols-[1fr_320px] gap-10">
          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
              Global Signal Summary
            </h2>
            <GlobalThreatSummary items={allItems} />

            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
              {searchParams.q || searchParams.category ? "Filtered Signals" : "Live Feed"}
            </h2>
            {failedSources.length > 0 && (
              <p className="text-xs text-alert font-mono mb-4">
                Couldn&apos;t reach: {failedSources.join(", ")}
              </p>
            )}
            <div className="grid gap-3">
              {filteredItems.length === 0 ? (
                <p className="text-text-muted text-sm italic">
                  No signals match your current filters. Try resetting search or category.
                </p>
              ) : (
                filteredItems.map((item, i) => (
                  <NewsCard
                    key={i}
                    item={item}
                    existingThread={existingThreads[item.link]}
                    isBookmarked={bookmarkUrls.has(item.link) || (existingThreads[item.link] && bookmarkThreadIds.has(existingThreads[item.link].id))}
                  />
                ))
              )}
            </div>
          </section>

          <aside className="space-y-8">
            <div>
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
                    Node Topology
                </h2>
                <NetworkTopology />
            </div>

            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
                  Activity Heartbeat
              </h2>
              <ActivityHeartbeat />
            </div>

            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
                  Learning Paths
              </h2>
              <LearningPathsPanel paths={LEARNING_PATHS} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
