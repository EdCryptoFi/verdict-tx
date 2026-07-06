/** Explore real TxODDS World Cup data: find a started match and inspect its scores + stat keys. */
import { txodds, hasCreds } from "../txoddsData.js";

if (!hasCreds) throw new Error("No creds — run `pnpm --filter @verdict/relayer subscribe` first");

const now = Date.now();
const raw: any = await txodds.fixturesSnapshot();
const list: any[] = Array.isArray(raw) ? raw : raw.fixtures ?? raw.data ?? [];
console.log(`fixtures: ${list.length}`);

const wc = list
  .map((f) => ({
    id: f.FixtureId,
    home: f.Participant1,
    away: f.Participant2,
    start: f.StartTime,
    comp: f.Competition,
  }))
  .sort((a, b) => a.start - b.start);

for (const f of wc) {
  const started = f.start < now;
  console.log(
    `  ${started ? "▶" : "·"} id=${f.id} ${f.home} v ${f.away} [${f.comp}] start=${new Date(f.start).toISOString()}`
  );
}

// Try scores for started fixtures (most recent first), until one returns data.
const started = wc.filter((f) => f.start < now).reverse();
const explicit = Number(process.argv[2]);
const tryList = explicit ? [wc.find((f) => f.id === explicit) ?? { id: explicit }] : started.slice(0, 6);

for (const f of tryList) {
  console.log(`\n── scores snapshot id=${f.id} (${(f as any).home ?? "?"} v ${(f as any).away ?? "?"}) ──`);
  try {
    const s: any = await txodds.scoresSnapshot(f.id);
    const str = JSON.stringify(s, null, 1);
    console.log(str.slice(0, 2200));
    if (str.length > 40) break; // found data
  } catch (e: any) {
    console.log("  error:", e.message);
  }
}
