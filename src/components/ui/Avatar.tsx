import { CURRENT_USER, initials } from "@/data/user";

// Initials avatar: no remote image, so it works offline and behind proxies.
const Avatar = ({ size = 40 }: { size?: number }) => {
  return (
    <span
      className="flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ring-2 ring-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(CURRENT_USER.name)}
    </span>
  );
};

export default Avatar;
