import { Audio } from "@remotion/media";
import { getStaticFiles } from "@remotion/studio";
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { z } from "zod";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { BrowserFrame } from "./BrowserFrame";
import { CallScreen } from "./CallScreen";
import { PhoneFrame } from "./PhoneFrame";
import { TalkingHead } from "./TalkingHead";

const FPS = 30;
// Each part's duration: intro = intro_2.mp4, demo = ring + dialog audio
// (silence_2.mp4 gets cropped to it), outro = outro_2.mp4.
const INTRO_FRAMES = Math.ceil(44.99 * FPS); // intro_2.mp4 duration
const RING_FRAMES = Math.ceil(2.04 * FPS); // phone_calling.mp3 duration
const OUTRO_FRAMES = Math.ceil(21.74 * FPS); // outro_2.mp4 duration
const CALL_START = INTRO_FRAMES;

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Everything company-specific comes from public/companies/<slug>/ (built by
// generate-demo.ts): screenshot.png (background), call.mp3 (dialog),
// metadata.json (names). Each folder becomes an option in the Studio dropdown.
const slugs = getStaticFiles()
  .map((f) => f.name.match(/^companies\/([^/]+)\/metadata\.json$/)?.[1])
  .filter((s): s is string => Boolean(s));

// With no generated folders yet (fresh clone) the dropdown is a free text field.
const schema = z.object({
  slug: slugs.length ? z.enum(slugs as [string, ...string[]]) : z.string(),
  callerName: z.string(),
  websiteUrl: z.string(),
  pageTitle: z.string().optional(),
  audioFrames: z.number(),
});

type Props = z.infer<typeof schema>;

const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const metadata = await (
    await fetch(staticFile(`companies/${props.slug}/metadata.json`))
  ).json();
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(staticFile(`companies/${props.slug}/call.mp3`)),
  });
  const audioFrames = Math.ceil((await input.computeDuration()) * FPS);
  return {
    durationInFrames: CALL_START + RING_FRAMES + audioFrames + OUTRO_FRAMES,
    props: {
      ...props,
      callerName: metadata.phoneDisplayName ?? metadata.companyName,
      websiteUrl: metadata.websiteUrl,
      pageTitle: metadata.companyName,
      audioFrames,
    },
  };
};

// Tailored marker that the call is illustrative, shown while the demo plays.
const DemoBadge: React.FC<{ name: string }> = ({ name }) => (
  <div className="absolute bottom-8 left-8 flex items-center gap-3 rounded-2xl bg-black/60 px-5 py-3 shadow-xl backdrop-blur-md">
    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
    <div className="leading-tight">
      <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55">
        Sample call for
      </div>
      <div className="text-[22px] font-semibold tracking-tight text-white">
        {name}
      </div>
    </div>
  </div>
);

export const MyComposition = () => {
  return (
    <Composition
      id="PhoneCall"
      component={PhoneCall}
      schema={schema}
      calculateMetadata={calculateMetadata}
      defaultProps={{
        slug: "sparkling-pools",
        callerName: "Sparkling Pools",
        websiteUrl: "https://sparklingpools.example",
        pageTitle: "Sparkling Pools",
        audioFrames: 30 * FPS,
      }}
      durationInFrames={120 * FPS}
      fps={FPS}
      width={1280}
      height={720}
    />
  );
};

const PhoneCall: React.FC<Props> = ({
  slug,
  callerName,
  websiteUrl,
  pageTitle,
  audioFrames,
}) => {
  const frame = useCurrentFrame();
  const callEnd = CALL_START + RING_FRAMES + audioFrames;
  // blur ramps in as the phone appears, out as it leaves
  const blurKeyframes = [
    CALL_START - 15,
    CALL_START + 10,
    callEnd - 10,
    callEnd + 15,
  ];

  return (
    <AbsoluteFill className="items-center justify-center">
      <Sequence name="Background website">
        <div
          className="h-full w-full"
          style={{
            filter: `blur(${interpolate(frame, blurKeyframes, [0, 18, 18, 0], clamp)}px)`,
            // slight zoom hides the soft edges the blur creates
            scale: String(
              interpolate(frame, blurKeyframes, [1, 1.06, 1.06, 1], clamp),
            ),
          }}
        >
          <BrowserFrame url={websiteUrl} title={pageTitle}>
            <Img
              src={staticFile(`companies/${slug}/screenshot.png`)}
              className="h-full w-full object-cover object-top"
            />
          </BrowserFrame>
        </div>
      </Sequence>
      <Sequence
        name="Phone call"
        from={CALL_START}
        durationInFrames={RING_FRAMES + audioFrames}
        layout="none"
      >
        <Sequence
          name="Ringing tone"
          durationInFrames={RING_FRAMES}
          layout="none"
        >
          <Audio src={staticFile("phone_calling.mp3")} />
        </Sequence>
        <Sequence name="Dialog audio" from={RING_FRAMES} layout="none">
          <Audio src={staticFile(`companies/${slug}/call.mp3`)} />
        </Sequence>
        <PhoneFrame>
          <CallScreen ringFrames={RING_FRAMES} callerName={callerName} />
        </PhoneFrame>
        <DemoBadge name={pageTitle ?? callerName} />
      </Sequence>
      <Sequence name="Intro head" durationInFrames={INTRO_FRAMES}>
        <TalkingHead src="intro_2.mp4" />
      </Sequence>
      <Sequence
        name="Demo reaction head"
        from={CALL_START}
        durationInFrames={RING_FRAMES + audioFrames}
      >
        <TalkingHead src="silence_2.mp4" muted />
      </Sequence>
      <Sequence name="Outro head" from={callEnd}>
        <TalkingHead src="outro_2.mp4" />
      </Sequence>
    </AbsoluteFill>
  );
};
