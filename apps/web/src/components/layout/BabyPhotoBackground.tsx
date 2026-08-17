import { useBaby } from "../../context/BabyContext";
import { resolveBabyPhotoUrl } from "../../utils/photo";

export default function BabyPhotoBackground() {
  const { activeBaby } = useBaby();
  const src = resolveBabyPhotoUrl(
    activeBaby?.photoUrl ?? null,
    activeBaby?.updatedAt
  );

  if (!src) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage: `url("${src}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "auto 560px",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-theme-page/75" />
    </div>
  );
}
