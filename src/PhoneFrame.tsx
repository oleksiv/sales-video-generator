import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const sideButton =
  "absolute w-[4px] rounded-l-[2px] bg-gradient-to-r from-zinc-300 via-zinc-500 to-zinc-700";

export const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <Interactive.Div
      name="iPhone"
      className="relative"
      style={{
        opacity: interpolate(
          frame,
          [0, 10, durationInFrames - 12, durationInFrames],
          [0, 1, 1, 0],
          clamp,
        ),

        scale: String(interpolate(frame, [0, 12], [0.96, 1], clamp)),
      }}
    >
      {/* action + volume buttons */}
      <div className={`${sideButton} -left-[3px] top-[130px] h-8`} />
      <div className={`${sideButton} -left-[3px] top-[185px] h-14`} />
      <div className={`${sideButton} -left-[3px] top-[252px] h-14`} />
      {/* power button */}
      <div className="absolute -right-[3px] top-[210px] h-20 w-[4px] rounded-r-[2px] bg-gradient-to-l from-zinc-300 via-zinc-500 to-zinc-700" />
      {/* titanium rim: polished edges catch light top and bottom */}
      <div
        className="relative h-[676px] w-[330px] rounded-[57px] p-[4px] shadow-[0_60px_120px_rgba(0,0,0,0.5),0_20px_40px_rgba(0,0,0,0.4)]"
        style={{
          background:
            "linear-gradient(175deg, #e4e4e7 0%, #71717a 6%, #3f3f46 20%, #52525b 50%, #3f3f46 80%, #8a8a92 94%, #d4d4d8 100%)",
        }}
      >
        {/* black bezel */}
        <div className="h-full w-full rounded-[53px] bg-black p-[11px]">
          {/* screen */}
          <div className="relative h-full w-full overflow-hidden rounded-[42px] bg-black">
            {children}
            {/* dynamic island with camera lens — 125×37pt @ 11pt top inset, scaled 0.763 */}
            <div className="absolute left-1/2 top-[8px] flex h-[28px] w-[95px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[7px]">
              <div className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[#101018]">
                <div className="h-[7px] w-[7px] rounded-full bg-[#1c2a45] shadow-[inset_1px_1px_2px_rgba(90,120,200,0.5)]" />
              </div>
            </div>
            {/* glass edge reflection */}
            <div className="pointer-events-none absolute inset-0 rounded-[42px] shadow-[inset_0_0_3px_rgba(255,255,255,0.18)]" />
          </div>
        </div>
      </div>
    </Interactive.Div>
  );
};
