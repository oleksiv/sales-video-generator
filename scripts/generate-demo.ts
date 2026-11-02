// Generates demo assets for a prospect (website screenshot + AI-written call
// script + receptionist call audio + metadata), then renders to out/<slug>.mp4.
// Needs ANTHROPIC_API_KEY (script), ELEVENLABS_API_KEY and two voice ids (voices). See .env.example.
// Usage: npm run generate-demo -- "Company Name" <https://site.com | screenshot.png> [browser-bar-url] --city=Phoenix [--force]
// --script-only prints the AI-written call script and exits (no screenshot, no audio, no render).
import "dotenv/config";
import { execSync } from "node:child_process";
import { createWriteStream, existsSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import Anthropic from "@anthropic-ai/sdk";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { chromium } from "playwright-core";

const FORCE = process.argv.includes("--force");
const SCRIPT_ONLY = process.argv.includes("--script-only");
let CITY = process.argv.find((arg) => arg.startsWith("--city="))?.slice(7);
let [COMPANY_NAME, SITE, BAR_URL] = process.argv
  .slice(2)
  .filter((arg) => !arg.startsWith("--"));
// --script-only never touches the website, so it doesn't need one
const needsSite = !SCRIPT_ONLY;
if (!COMPANY_NAME || (needsSite && !SITE) || !CITY) {
  // async iterator instead of rl.question: it buffers lines, so piped
  // stdin (echo "..." | npm run generate-demo) works, not just a TTY
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (prompt: string) => {
    process.stdout.write(prompt);
    return ((await lines.next()).value ?? "").trim();
  };
  COMPANY_NAME ||= await ask("Company name: ");
  if (needsSite) {
    SITE ||= await ask("Website URL or screenshot path: ");
    if (existsSync(SITE) && !BAR_URL) {
      BAR_URL = await ask("Website URL shown in the browser bar (optional): ");
    }
  }
  CITY ||= await ask("City the business serves (e.g. Phoenix): ");
  rl.close();
}
if (!COMPANY_NAME || (needsSite && !SITE) || !CITY) {
  console.error(
    'Usage: npm run generate-demo -- "Company Name" <https://site.com | screenshot.png> [browser-bar-url] --city=Phoenix [--force|--script-only]',
  );
  process.exit(1);
}
// The receptionist half of the demo has to behave like the real deployment, or
// the video promises something the product doesn't do. The voice agent's system
// prompt is the spec Claude writes against — keep agent-spec.md in sync with the
// deployed agent's config.
const PROD_AGENT_PROMPT = await readFile(
  new URL("agent-spec.md", import.meta.url),
  "utf8",
);

// The demo caller has to sound like a local customer: a Phoenix pool company
// hearing a Fort Myers address and a 239 number knows the video is a template.
// Claude writes the whole call — it knows the area code and street names for the
// city, so there is no zip/area-code table to maintain.
const SCRIPT_PROMPT = `Write a short demo phone call to the AI receptionist of "${COMPANY_NAME}", a home-service company serving ${CITY}. It will be voiced and shown to the owner of ${COMPANY_NAME} as a sample of what their own receptionist would sound like.

The receptionist is the production voice agent specified below, deployed for ${COMPANY_NAME}. Write its lines to that spec — same persona, tone, workflow, and guardrails. The spec is written for a pool company called 'Sparkling Pools'; the only things that change are the company name and, if "${COMPANY_NAME}" clearly isn't a pool company, the trade.

<agent_spec>
${PROD_AGENT_PROMPT}
</agent_spec>

Now the demo-specific requirements:

- Play out one of the call types in the spec's workflow from start to finish, following that workflow's steps. A repair call or a quote request demos best.
- The receptionist greets with "Thank you for calling ${COMPANY_NAME}." and never states a personal name — the voice differs per demo, so the spec's "Jason" must not be spoken.
- Honour the guardrails: no firm price, no exact callback time, and the caller's name, callback number, and service address all get captured.
- The caller is an ordinary local customer, not an agent: she doesn't follow a script, and her lines are shorter and less polished than the receptionist's.
- The caller is always a woman and must be given a woman's name — she is voiced by a female voice actor, so a man's name contradicts the audio.
- The caller must sound local: a real ${CITY} area code, a plausible ${CITY} street address. The number's exchange must be 555-01xx (the range reserved for fiction) — only the area code is real.
- Aim for about 12 lines, alternating receptionist/caller and starting with the receptionist. Run a little longer if the call needs it — never rush a beat or cut the ending short just to hit the number.
- Every line — receptionist and caller alike — opens with exactly one emotion tag, as in the spec's own "[warmly]" and "[thoughtfully]". These are ElevenLabs v3 audio tags and both voices need them; a line without one is read flat.
- The last two lines close the call: the receptionist confirms the details back and states the next step, then the caller signs off. The call must sound finished, not cut off mid-booking.`;

const SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    callerName: { type: "string" },
    dialog: {
      type: "array",
      items: {
        type: "object",
        properties: {
          speaker: { type: "string", enum: ["receptionist", "caller"] },
          text: { type: "string" },
        },
        required: ["speaker", "text"],
        additionalProperties: false,
      },
    },
  },
  required: ["callerName", "dialog"],
  additionalProperties: false,
} as const;

type Script = {
  callerName: string;
  dialog: { speaker: "receptionist" | "caller"; text: string }[];
};

async function generateScript(): Promise<Script> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Set the ANTHROPIC_API_KEY environment variable (e.g. in .env).");
    process.exit(1);
  }
  const anthropic = new Anthropic();
  const message = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: SCRIPT_SCHEMA } },
    messages: [{ role: "user", content: SCRIPT_PROMPT }],
  });
  const text = message.content.find((b) => b.type === "text");
  if (!text) {
    console.error(`Claude returned no script (stop_reason: ${message.stop_reason}).`);
    process.exit(1);
  }
  const script: Script = JSON.parse(text.text);
  for (const line of script.dialog) {
    console.log(`  ${line.speaker === "caller" ? "caller " : "clerk  "} ${line.text}`);
  }
  return script;
}

// --script-only: write the call and stop, so a script can be iterated on without
// paying for a screenshot, an ElevenLabs generation, and a render each time.
if (SCRIPT_ONLY) {
  console.log(`\n${COMPANY_NAME} — ${CITY}\n`);
  await generateScript();
  process.exit(0);
}

// Voice ids come from your own ElevenLabs library (see .env.example).
const RECEPTIONIST_VOICE = process.env.ELEVENLABS_RECEPTIONIST_VOICE;
const CALLER_VOICE = process.env.ELEVENLABS_CALLER_VOICE;
if (!RECEPTIONIST_VOICE || !CALLER_VOICE) {
  console.error("Set ELEVENLABS_RECEPTIONIST_VOICE and ELEVENLABS_CALLER_VOICE (e.g. in .env).");
  process.exit(1);
}

// an existing file → use it as the screenshot; anything else → URL to visit
const SCREENSHOT_SRC = existsSync(SITE) ? SITE : null;
if (!SCREENSHOT_SRC && /\.(png|jpe?g|webp)$/i.test(SITE)) {
  console.error(`Screenshot not found: ${SITE}`);
  process.exit(1);
}

const slug = COMPANY_NAME.toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");
const dir = `public/companies/${slug}`;
// keep the human-readable name; only strip chars that break file paths
const outFile = `out/${COMPANY_NAME.replace(/[/:]/g, "-")}.mp4`;

// with a provided screenshot the URL is only cosmetic (browser address bar)
let WEBSITE_URL = SCREENSHOT_SRC ? BAR_URL || `${slug}.com` : SITE;
if (!/^https?:\/\//.test(WEBSITE_URL)) WEBSITE_URL = `https://${WEBSITE_URL}`;

console.log(`
Company:  ${COMPANY_NAME}
Website:  ${WEBSITE_URL}${SCREENSHOT_SRC ? `\nShot:     ${SCREENSHOT_SRC}` : ""}
City:     ${CITY}
Assets:   ${dir}
Video:    ${outFile}
`);

// metadata.json is written last, so its presence means the assets are complete —
// a folder alone can be a leftover from a run that died partway. The city is
// spoken in call.mp3, so a different city has to re-generate it: reusing audio
// that names the wrong city is the whole bug this guards against.
const cached = existsSync(`${dir}/metadata.json`)
  ? JSON.parse(await readFile(`${dir}/metadata.json`, "utf8"))
  : null;
if (cached && cached.city === CITY && !FORCE) {
  console.log(`[1-4/5] ${dir} already exists, skipping generation (--force to redo).`);
} else {
  if (cached && cached.city !== CITY) {
    console.log(`[1-4/5] Cached call says "${cached.city ?? "Fort Myers"}", need "${CITY}" — re-generating.`);
  }
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("Set the ELEVENLABS_API_KEY environment variable (e.g. in .env).");
    process.exit(1);
  }
  await mkdir(dir, { recursive: true });

  // 1. Screenshot: copy the provided image, or capture the website
  const screenshotPath = `${dir}/screenshot.png`;
  if (SCREENSHOT_SRC) {
    console.log("[1/5] Copying provided screenshot…");
    await copyFile(SCREENSHOT_SRC, screenshotPath);
  } else {
    console.log("[1/5] Screenshotting website…");
    const size = { width: 1920, height: 1080 };
    const browser = await chromium.launch({ channel: "chrome" });
    const page = await browser.newPage({ viewport: size, locale: "en-US" });
    await page.goto(WEBSITE_URL, { waitUntil: "load" });
    // Google properties (Maps links etc.) redirect to a consent screen first.
    // Google's "Accept all" form carries set_eom=false regardless of language;
    // the text fallback dismisses common cookie banners on regular sites.
    await page
      .locator('form:has(input[name="set_eom"][value="false"]) button')
      .or(page.getByRole("button", { name: /accept all/i }))
      .first()
      .click({ timeout: 3000 })
      .then(() => page.waitForLoadState("load"))
      .catch(() => {});
    await page.waitForTimeout(2000); // let fonts/heroes settle
    await page.screenshot({ path: screenshotPath });
    await browser.close();
  }
  console.log(`Saved ${screenshotPath}`);

  // 2. Call script, tailored to the company and city
  console.log("[2/5] Writing the call script (Claude)…");
  const script = await generateScript();

  // 3. Dialog audio
  console.log(`[3/5] Generating call audio (${script.dialog.length} dialog lines, ElevenLabs — takes a minute)…`);
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });
  const { data: audio, rawResponse } = await elevenlabs.textToDialogue
    .convert({
      inputs: script.dialog.map(({ speaker, text }) => ({
        text,
        voiceId: speaker === "caller" ? CALLER_VOICE : RECEPTIONIST_VOICE,
      })),
    })
    .withRawResponse();
  const audioPath = `${dir}/call.mp3`;
  // DOM ReadableStream vs node:stream/web ReadableStream — same shape, different lib types
  await pipeline(
    Readable.fromWeb(audio as import("node:stream/web").ReadableStream),
    createWriteStream(audioPath),
  );
  console.log(`Saved ${audioPath}`);

  // Cost comes from the generation's character-cost response header.
  // The $ estimate needs the user_read key permission — skipped without it.
  const credits = Number(rawResponse.headers.get("character-cost")) || 0;
  let costLine = `ElevenLabs: ${credits || "?"} credits used`;
  const PLAN_USD: Record<string, number> = {
    free: 0,
    starter: 5,
    creator: 22,
    pro: 99,
    scale: 330,
    business: 1320,
  };
  try {
    const sub = await elevenlabs.user.subscription.get();
    if (credits && sub.characterLimit && PLAN_USD[sub.tier] !== undefined) {
      costLine += ` (≈$${((credits * PLAN_USD[sub.tier]) / sub.characterLimit).toFixed(3)} on ${sub.tier} plan)`;
    }
    costLine += `, ${sub.characterLimit - sub.characterCount} left this cycle`;
  } catch {
    costLine += " — add the user_read permission to your API key for $ estimate and remaining balance";
  }
  console.log(costLine);

  // 4. Metadata used by the Remotion composition
  console.log("[4/5] Writing metadata…");
  const metadata = {
    companyName: COMPANY_NAME,
    phoneDisplayName: COMPANY_NAME, // shown as the caller name on the phone screen
    websiteUrl: WEBSITE_URL,
    city: CITY, // baked into call.mp3 — the record of what the demo caller says
    callerName: script.callerName,
    generatedAt: new Date().toISOString(),
  };
  await writeFile(`${dir}/metadata.json`, JSON.stringify(metadata, null, 2));
  console.log(`Saved ${dir}/metadata.json`);
}

// 5. Render
console.log("[5/5] Rendering video with Remotion…");
execSync(
  `npx remotion render PhoneCall ${JSON.stringify(outFile)} --props='${JSON.stringify({ slug })}'`,
  { stdio: "inherit" },
);
console.log(`Done: ${outFile}`);