const size = { width: 27, height: 27, viewBox: "0 0 24 24" };

export const MuteIcon = () => (
  <svg {...size}>
    <defs>
      <mask id="mute-slash">
        <rect width="24" height="24" fill="white" />
        <line x1="4.4" y1="1.4" x2="20.4" y2="20.4" stroke="black" strokeWidth={3.6} />
      </mask>
    </defs>
    <g mask="url(#mute-slash)">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="white" />
      <path
        d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5"
        fill="none"
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </g>
    <line
      x1="5"
      y1="2.5"
      x2="20.5"
      y2="21"
      stroke="white"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);

export const KeypadIcon = () => (
  <svg {...size} fill="white">
    {[5, 12, 19].flatMap((x) =>
      [4.5, 10, 15.5].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1.7} />),
    )}
    <circle cx={12} cy={21} r={1.7} />
  </svg>
);

export const SpeakerIcon = () => (
  <svg {...size}>
    <path d="M4 9.5h3.5L13 5v14l-5.5-4.5H4z" fill="white" />
    <path
      d="M16 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"
      fill="none"
      stroke="white"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);

export const PlusIcon = () => (
  <svg {...size} fill="none" stroke="white" strokeWidth={1.9} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const VideoIcon = () => (
  <svg {...size} fill="white">
    <rect x="2.5" y="7" width="13" height="10" rx="2.5" />
    <path d="M16.5 11l5-3.2v8.4l-5-3.2z" />
  </svg>
);

export const PersonIcon = () => (
  <svg {...size} fill="white">
    <defs>
      <clipPath id="person-circle">
        <circle cx="12" cy="12" r="9.4" />
      </clipPath>
    </defs>
    <circle cx="12" cy="12" r="9.4" fill="none" stroke="white" strokeWidth={1.6} />
    <g clipPath="url(#person-circle)">
      <circle cx="12" cy="9.8" r="3.1" />
      <path d="M12 14.6c-3.3 0-6.1 1.9-7 4.6a9.4 9.4 0 0 0 14 0c-.9-2.7-3.7-4.6-7-4.6z" />
    </g>
  </svg>
);

export const PhoneDownIcon = () => (
  <svg width={32} height={32} viewBox="0 0 24 24" fill="white">
    <path d="M12 9c-2.9 0-5.6.6-8 1.7-.6.3-1 .9-1 1.6v2.2c0 .8.7 1.5 1.5 1.4l3.4-.4c.7-.1 1.2-.6 1.3-1.3l.2-1.4c.8-.2 1.7-.3 2.6-.3s1.8.1 2.6.3l.2 1.4c.1.7.6 1.2 1.3 1.3l3.4.4c.8.1 1.5-.6 1.5-1.4v-2.2c0-.7-.4-1.3-1-1.6C17.6 9.6 14.9 9 12 9z" />
  </svg>
);

export const SignalIcon = () => (
  <svg width={18} height={12} viewBox="0 0 18 11" fill="white">
    <rect x="0" y="7" width="3" height="4" rx="1" />
    <rect x="5" y="4.5" width="3" height="6.5" rx="1" />
    <rect x="10" y="2" width="3" height="9" rx="1" />
    <rect x="15" y="0" width="3" height="11" rx="1" />
  </svg>
);

export const WifiIcon = () => (
  <svg
    width={17}
    height={12}
    viewBox="0 0 24 18"
    fill="none"
    stroke="white"
    strokeWidth={2.4}
    strokeLinecap="round"
  >
    <path d="M2 6a15 15 0 0 1 20 0M5.5 10a10 10 0 0 1 13 0M9 13.5a5 5 0 0 1 6 0" />
    <circle cx="12" cy="16.4" r="1.4" fill="white" stroke="none" />
  </svg>
);

export const BatteryIcon = () => (
  <svg width={25} height={12} viewBox="0 0 25 12" fill="none">
    <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="white" strokeOpacity="0.4" />
    <rect x="2" y="2" width="18" height="8" rx="2" fill="white" />
    <path d="M23 4v4a2 2 0 0 0 0-4z" fill="white" fillOpacity="0.4" />
  </svg>
);
