# Sales video generator

One command renders a personalized demo video for a single prospect.

```
npm run generate-demo -- "Aqua Harmony Pools" https://aquaharmonypools.example --city=Phoenix
```

What happens:

1. **Playwright** opens the prospect's website at 1920×1080, dismisses the cookie banner, and takes a screenshot.
2. **Claude** writes a short phone call between a local customer and the AI receptionist. It writes against the production voice agent's own system prompt ([scripts/agent-spec.md](scripts/agent-spec.md)), so the demo cannot promise anything the deployed agent does not do.
3. **ElevenLabs v3** voices both sides of the call in one text-to-dialogue request, with an emotion tag on every line.
4. **Remotion** composes the prospect's site in a browser frame, a phone overlay with the ringing call, a talking-head intro and outro, and renders `out/<Company>.mp4`.

A finished video is about ninety seconds and costs a few cents in API calls.

## Why it exists

Cold outreach with a generic demo gets ignored. A demo that shows the prospect's own website and a caller with their own area code gets watched. Making one by hand takes an hour; this takes one command, so every prospect gets one.

The constraint in step 2 is the part worth copying: the script is generated from the real agent's spec, not from a marketing brief, which keeps the sales material honest by construction.

## Setup

```
npm install
cp .env.example .env   # fill in the keys and two ElevenLabs voice ids
```

Google Chrome has to be installed; Playwright drives it through the `chrome` channel.

## Commands

| Command | What it does |
|---|---|
| `npm run generate-demo -- "Name" <url or screenshot.png> [bar-url] --city=City` | Full pipeline, renders `out/Name.mp4`. Assets go to `public/companies/<slug>/` and are reused on the next run. |
| `… --script-only` | Prints the call script and exits. Iterate on the prompt without paying for voices or a render. |
| `… --force` | Regenerate assets even if the folder exists. |
| `npm run dev` | Remotion Studio. Every folder in `public/companies/` appears in the props dropdown. |
| `npm run record-site -- <url> [seconds]` | Records a site with its animations to `public/site-recording.webm`, for compositions that want motion instead of a still. |

## Sample

[sample/sparkling-pools.html](sample/sparkling-pools.html) is a landing page for a fictional pool company, with its screenshot next to it, so you can try the pipeline without pointing it at a real business:

```
npm run generate-demo -- "Sparkling Pools" sample/sparkling-pools.png sparklingpools.example --city=Phoenix
```

That writes `public/companies/sparkling-pools/` and renders `out/Sparkling Pools.mp4`. Open `npm run dev` afterwards and the sample appears in the props dropdown.

## Layout

```
scripts/generate-demo.ts   the pipeline: screenshot, script, voices, render
scripts/agent-spec.md      the voice agent's system prompt, the spec the script is written against
scripts/record-site.mjs    optional: record a site with animations
src/Composition.tsx        the Remotion composition and its props
src/BrowserFrame.tsx       browser chrome around the screenshot
src/PhoneFrame.tsx         phone overlay
src/CallScreen.tsx         ringing and in-call screen
src/TalkingHead.tsx        circular video of the presenter
public/                    intro, outro, silence loop, ringing tone, generated company folders
```

## Details that mattered

- **Cache keyed by city.** The city is spoken in the call audio, so a cached call for the wrong city is regenerated. `metadata.json` is written last, so its presence means the folder is complete.
- **Fictional numbers.** The caller's area code is real for the city, the exchange is always 555-01xx, the range reserved for fiction.
- **No personal name for the receptionist.** The voice changes per demo, so the spec's persona name is never spoken.
- **Cost shown after each run.** The ElevenLabs character cost comes back in a response header and is printed with an estimate in dollars for your plan.

## License

MIT. Written by [Sviatoslav Oleksiv](https://oleksiv.com).
