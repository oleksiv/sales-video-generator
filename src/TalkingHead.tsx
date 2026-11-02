import { Video } from "@remotion/media";
import { Interactive, staticFile } from "remotion";

// Sources are 16:9 (3840x2160). A 462x260 box centered in the 260px circle
// crops the sides — the manual equivalent of object-cover center center.
export const TalkingHead: React.FC<{ src: string; muted?: boolean }> = ({
  src,
  muted,
}) => {
  return (
    <Interactive.Div
      name="Talking head"
      className="absolute bottom-8 right-8 h-[260px] w-[260px] overflow-hidden rounded-full shadow-2xl"
    >
      <Video
        src={staticFile(src)}
        muted={muted}
        className="absolute left-1/2 top-1/2 h-[260px] w-[462px] -translate-x-1/2 -translate-y-1/2"
      />
    </Interactive.Div>
  );
};
