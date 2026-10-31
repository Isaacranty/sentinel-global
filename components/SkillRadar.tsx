"use client";

type Props = {
  skills: Record<string, number>;
};

export default function SkillRadar({ skills }: Props) {
  const maxSkill = 100;

  return (
    <div className="bg-panel border border-panelLine rounded-sm p-6">
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-6">Expertise Radar</h3>

      <div className="space-y-4">
        {Object.entries(skills).map(([name, value]) => {
          const percent = Math.min(100, Math.round((value / maxSkill) * 100));
          return (
            <div key={name}>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-text-muted">{name}</span>
                <span className="text-signal">{value} <small className="text-[8px]">PTS</small></span>
              </div>
              <div className="w-full bg-ink h-1 rounded-full overflow-hidden">
                <div
                  className="bg-signal h-full transition-all duration-1000"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-[9px] font-mono text-text-muted italic leading-tight">
        * expertise is calculated based on successful signal decryptions and mission parameters.
      </p>
    </div>
  );
}
