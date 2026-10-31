import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProfile } from "@/lib/userStore";
import { LEARNING_PATHS } from "@/lib/learningPaths";
import { COURSES } from "@/lib/courses";
import { listChallenges } from "@/lib/challenges";
import SkillRadar from "@/components/SkillRadar";
import BriefToggle from "@/components/BriefToggle";
import AvatarUpload from "@/components/AvatarUpload";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const profile = await getUserProfile(session.user.id);
  const challenges = listChallenges();

  const solvedChallengeNames = profile.solvedChallenges.map(s => {
    const c = challenges.find(ch => ch.id === s.challengeId);
    return { name: c?.title || s.challengeId, id: s.challengeId };
  });

  // Calculate overall stats
  const totalResources = LEARNING_PATHS.reduce((acc, p) => acc + p.resources.length, 0);
  const completedResources = profile.progress.length;
  const overallProgress = Math.round((completedResources / totalResources) * 100) || 0;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <AvatarUpload currentUrl={profile.user?.avatarUrl} />
        </div>
        <div className="mb-10">
            <BriefToggle initialStatus={profile.user?.subscribedToBrief ?? true} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="border border-panelLine bg-panel p-4 rounded-sm text-center">
            <span className="block font-mono text-[10px] text-text-muted uppercase mb-1">XP Points</span>
            <span className="text-2xl font-mono text-signal">{profile.xp}</span>
          </div>
          <div className="border border-panelLine bg-panel p-4 rounded-sm text-center">
            <span className="block font-mono text-[10px] text-text-muted uppercase mb-1">Decrypted</span>
            <span className="text-2xl font-mono text-text">{profile.solvedChallenges.length}</span>
          </div>
          <div className="border border-panelLine bg-panel p-4 rounded-sm text-center">
            <span className="block font-mono text-[10px] text-text-muted uppercase mb-1">Completion</span>
            <span className="text-2xl font-mono text-signal">{overallProgress}%</span>
          </div>
          <div className="border border-panelLine bg-panel p-4 rounded-sm">
            <span className="block font-mono text-[10px] text-text-muted uppercase mb-1 text-center">Level Progress</span>
            <div className="mt-3">
                <div className="flex justify-between text-[8px] font-mono text-text-muted mb-1">
                    <span>{profile.xp} XP</span>
                    <span>{profile.nextLevelXp} XP</span>
                </div>
                <div className="w-full bg-ink h-1 rounded-full overflow-hidden">
                    <div className="bg-signal h-full transition-all" style={{ width: `${profile.levelProgress}%` }} />
                </div>
            </div>
          </div>
        </div>

        <section className="mb-10">
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
                Operator Expertise
            </h2>
            <div className="grid md:grid-cols-[1fr_300px] gap-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-fit">
                    {profile.badges.length === 0 ? (
                        <div className="col-span-full border border-dashed border-panelLine p-8 text-center">
                            <p className="text-xs text-text-muted italic">Decrypt signals or complete training to earn medals.</p>
                        </div>
                    ) : (
                        profile.badges.map(badge => (
                            <div key={badge.id} className="border border-panelLine bg-panel/40 p-4 rounded-sm flex items-center gap-3">
                                <span className="text-2xl">{badge.icon}</span>
                                <div>
                                    <h4 className="text-xs font-bold text-text">{badge.name}</h4>
                                    <p className="text-[9px] text-text-muted leading-tight">{badge.description}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <SkillRadar skills={profile.skillMap} />
            </div>
        </section>

        <div className="grid md:grid-cols-2 gap-10">
          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
              Training Progress
            </h2>
            <div className="grid gap-3">
              {LEARNING_PATHS.map(path => {
                  const pathProgress = profile.progress.filter(p => p.pathId === path.id);
                  const percent = Math.round((pathProgress.length / path.resources.length) * 100) || 0;
                  return (
                      <div key={path.id} className="border border-panelLine bg-panel rounded-sm p-4">
                          <div className="flex justify-between items-baseline mb-2">
                              <h3 className="text-sm font-semibold">{path.title}</h3>
                              <span className="font-mono text-xs text-signal">{percent}%</span>
                          </div>
                          <div className="w-full bg-ink h-1 rounded-full overflow-hidden">
                              <div
                                  className="bg-signal h-full transition-all"
                                  style={{ width: `${percent}%` }}
                              />
                          </div>
                      </div>
                  );
              })}
            </div>

            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mt-10 mb-4">
              Academy Enrollment
            </h2>
            <div className="grid gap-3">
              {COURSES.map(course => {
                  const completedLessons = profile.courseProgress.filter(cp => cp.courseId === course.id).length;
                  const percent = Math.round((completedLessons / course.lessons.length) * 100) || 0;
                  const certificate = profile.certificates.find(c => c.courseId === course.id);

                  return (
                      <div key={course.id} className="border border-panelLine bg-panel rounded-sm p-4">
                          <div className="flex justify-between items-baseline mb-2">
                              <Link href={`/courses/${course.id}/${course.lessons[0].id}`} className="text-sm font-semibold hover:text-signal transition-colors">{course.title}</Link>
                              <span className="font-mono text-xs text-signal">{percent}%</span>
                          </div>
                          <div className="w-full bg-ink h-1 rounded-full overflow-hidden mb-3">
                              <div
                                  className="bg-signal h-full transition-all"
                                  style={{ width: `${percent}%` }}
                              />
                          </div>
                          {certificate && (
                              <Link
                                href={`/profile/certificate/${certificate.id}`}
                                className="inline-block text-[9px] font-mono text-signal uppercase border border-signal/30 px-2 py-0.5 rounded-full hover:bg-signal/10 transition-colors"
                              >
                                [ View Certificate ]
                              </Link>
                          )}
                      </div>
                  );
              })}
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
              Solved Signals (CTF)
            </h2>
            <div className="border border-panelLine bg-panel rounded-sm p-4">
              {solvedChallengeNames.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No signals decrypted yet.</p>
              ) : (
                  <ul className="space-y-2">
                      {solvedChallengeNames.map((c, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs font-mono">
                              <span className="text-signal">[OK]</span>
                              <Link href={`/ctf/${c.id}`} className="hover:underline">{c.name}</Link>
                          </li>
                      ))}
                  </ul>
              )}
            </div>

            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mt-8 mb-4">
              Recent Transmissions
            </h2>
            <div className="grid gap-2">
              {profile.threads.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No threads started.</p>
              ) : (
                  profile.threads.map(t => (
                      <Link
                          key={t.id}
                          href={`/community/${t.id}`}
                          className="block border border-panelLine bg-panel rounded-sm p-3 hover:border-signal/60 transition-colors"
                      >
                          <h4 className="text-xs font-semibold truncate">{t.title}</h4>
                          <span className="text-[10px] font-mono text-text-muted">
                              {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                      </Link>
                  ))
              )}
            </div>

            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mt-8 mb-4">
              Saved Intelligence
            </h2>
            <div className="grid gap-2">
              {profile.bookmarks.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No signals saved.</p>
              ) : (
                  profile.bookmarks.map(b => {
                      const href = b.threadId ? `/community/${b.threadId}` : b.newsUrl || "#";
                      return (
                          <a
                              key={b.id}
                              href={href}
                              target={b.threadId ? "_self" : "_blank"}
                              className="block border border-panelLine bg-panel rounded-sm p-3 hover:border-signal/60 transition-colors"
                          >
                              <h4 className="text-xs font-semibold truncate">{b.title}</h4>
                              <span className="text-[10px] font-mono text-text-muted uppercase">
                                  {b.threadId ? "Discussion" : "External Feed"}
                              </span>
                          </a>
                      )
                  })
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
