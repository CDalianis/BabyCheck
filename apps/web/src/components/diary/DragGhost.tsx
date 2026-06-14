import { EVENT_STYLES } from "../../constants/eventStyles";
import {
  type DiaryDragState,
  formatDropMinutes,
} from "../../hooks/useDiaryDrag";
import { formatEventTime, getEventSummary } from "../../utils/eventSummary";

interface DragGhostProps {
  dragState: DiaryDragState;
}

export default function DragGhost({ dragState }: DragGhostProps) {
  const { event, ghostX, ghostY, ghostWidth, dropTarget } = dragState;
  const styles = EVENT_STYLES[event.type];
  const timeLabel = dropTarget
    ? formatDropMinutes(dropTarget.minutes)
    : formatEventTime(event.occurredAt);

  return (
    <div
      className="pointer-events-none fixed z-[60] rounded-lg border px-2 py-1 shadow-lg"
      style={{
        left: ghostX + 8,
        top: ghostY + 8,
        width: Math.max(ghostWidth, 96),
        transform: "translate(0, -50%)",
      }}
    >
      <div className={`rounded-lg border px-1.5 py-1 ${styles.bg} ${styles.border}`}>
        <p className="font-mono text-[10px] font-semibold text-theme-muted">
          {timeLabel}
        </p>
        <p className={`truncate text-[10px] font-semibold ${styles.text}`}>
          {getEventSummary(event)}
        </p>
      </div>
    </div>
  );
}
