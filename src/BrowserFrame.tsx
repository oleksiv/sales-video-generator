const GREY = "#5f6368";

const LockIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill={GREY}>
    <path d="M6 10V8a6 6 0 0 1 12 0v2h1a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a1 1 0 0 1 1-1h1zm2 0h8V8a4 4 0 0 0-8 0v2z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={GREY} strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18" />
  </svg>
);

const BackIcon = ({ disabled = false }) => (
  <svg
    width={22}
    height={22}
    viewBox="0 0 24 24"
    fill="none"
    stroke={disabled ? "#bdc1c6" : GREY}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5m6 6-6-6 6-6" />
  </svg>
);

const ReloadIcon = () => (
  <svg width={19} height={19} viewBox="0 0 24 24" fill={GREY}>
    <path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
);

const StarIcon = () => (
  <svg
    width={17}
    height={17}
    viewBox="0 0 24 24"
    fill="none"
    stroke={GREY}
    strokeWidth={1.7}
    strokeLinejoin="round"
  >
    <path d="m12 3.5 2.6 5.6 6.1.7-4.5 4.1 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.1 6.1-.7z" />
  </svg>
);

const ExtensionIcon = () => (
  <svg width={19} height={19} viewBox="0 0 24 24" fill={GREY}>
    <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-2 .9-2 2v3.8h1.5a2.7 2.7 0 0 1 0 5.4H2V20c0 1.1.9 2 2 2h3.8v-1.5a2.7 2.7 0 0 1 5.4 0V22H17c1.1 0 2-.9 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z" />
  </svg>
);

const KebabIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill={GREY}>
    <circle cx="12" cy="5" r="1.9" />
    <circle cx="12" cy="12" r="1.9" />
    <circle cx="12" cy="19" r="1.9" />
  </svg>
);

const CloseIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={GREY} strokeWidth={2} strokeLinecap="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const BrowserFrame: React.FC<{
  url: string;
  title?: string;
  children: React.ReactNode;
}> = ({ url, title, children }) => {
  const domain = new URL(url).hostname.replace(/^www\./, "");

  return (
    <div className="flex h-full w-full flex-col font-sans">
      {/* tab strip */}
      <div className="flex h-[44px] shrink-0 items-end bg-[#dee1e6] px-3">
        {/* traffic lights */}
        <div className="mb-[15px] mr-4 flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        {/* active tab */}
        <div className="flex h-[36px] w-[250px] items-center gap-2 rounded-t-[10px] bg-white px-3.5 text-[13px] text-[#3c4043]">
          <GlobeIcon />
          <span className="min-w-0 flex-1 truncate">{title ?? domain}</span>
          <CloseIcon />
        </div>
        {/* new tab */}
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          className="mb-2 ml-3"
          fill="none"
          stroke={GREY}
          strokeWidth={2}
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      {/* toolbar */}
      <div className="flex h-[50px] shrink-0 items-center gap-1 bg-white px-3">
        <div className="flex items-center gap-4 px-1.5">
          <BackIcon />
          <span className="-scale-x-100">
            <BackIcon disabled />
          </span>
          <ReloadIcon />
        </div>
        {/* omnibox */}
        <div className="mx-1.5 flex h-[36px] min-w-0 flex-1 items-center gap-2.5 rounded-full bg-[#f1f3f4] px-4 text-[14.5px]">
          <LockIcon />
          <span className="min-w-0 flex-1 truncate text-[#202124]">{domain}</span>
          <StarIcon />
        </div>
        <div className="flex items-center gap-4 px-2">
          <ExtensionIcon />
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500" />
          <KebabIcon />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
};
