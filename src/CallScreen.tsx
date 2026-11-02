import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  BatteryIcon,
  KeypadIcon,
  MuteIcon,
  PersonIcon,
  PhoneDownIcon,
  PlusIcon,
  SignalIcon,
  SpeakerIcon,
  VideoIcon,
  WifiIcon,
} from "./icons";

const ACTIONS = [
  { label: "mute", icon: <MuteIcon /> },
  { label: "keypad", icon: <KeypadIcon /> },
  { label: "audio", icon: <SpeakerIcon /> },
  { label: "add call", icon: <PlusIcon /> },
  { label: "FaceTime", icon: <VideoIcon /> },
  { label: "contacts", icon: <PersonIcon /> },
];

export const CallScreen: React.FC<{
  ringFrames?: number;
  callerName: string;
}> = ({ ringFrames = 0, callerName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, Math.floor((frame - ringFrames) / fps));
  const timer = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const status = frame < ringFrames ? "calling…" : timer;

  return (
    <div
      className="flex h-full w-full flex-col text-white"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
        background:
          "radial-gradient(circle at 50% 42%, #05070c 0%, #0a1220 52%, #1d2c48 130%)",
      }}
    >
      {/* status bar — 59pt tall, 16pt edge margins, centered on the Dynamic Island (scaled 0.763) */}
      <div className="relative flex h-[45px] items-center justify-between px-3 text-[15px] font-semibold">
        <span>9:41</span>
        <span className="flex items-center gap-1.5">
          <SignalIcon />
          <WifiIcon />
          <BatteryIcon />
        </span>
      </div>

      {/* caller */}
      <div className="relative mt-7 flex flex-col items-center">
        <div className="text-[30px] tracking-tight">{callerName}</div>
        <div className="mt-1 text-[16px] tabular-nums text-white/55">
          {status}
        </div>
      </div>

      {/* actions */}
      <div className="flex-[1.3]" />
      <div className="relative grid grid-cols-3 gap-y-5 px-4">
        {ACTIONS.map((action) => (
          <div key={action.label} className="flex flex-col items-center">
            <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-white/[0.14]">
              {action.icon}
            </div>
            <div className="mt-1.5 text-[13px] text-white/90">
              {action.label}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1" />
      <div className="relative flex justify-center">
        <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#f24640]">
          <PhoneDownIcon />
        </div>
      </div>
      <div className="flex-[1.3]" />

      {/* home indicator */}
      <div className="absolute bottom-[9px] left-1/2 h-[5px] w-[125px] -translate-x-1/2 rounded-full bg-white/90" />
    </div>
  );
};
