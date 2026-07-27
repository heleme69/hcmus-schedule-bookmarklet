import { periodsToClockRange } from "../config/periodTimes.js";
import { SEMESTER_WEEKS } from "../config/semester.js";

const VN_UTC_OFFSET_HOURS = 7;

function nextOrSameWeekday(baseDate, targetDayOfWeek) {
  const result = new Date(baseDate.getTime());
  const diff = (targetDayOfWeek - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + diff);
  return result;
}

function toICSDateTimeUTC(localDate, hhmm) {
  const [hour, minute] = hhmm.split(":").map(Number);
  const utcMs = Date.UTC(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    hour - VN_UTC_OFFSET_HOURS,
    minute,
    0
  );
  const d = new Date(utcMs);
  const pad = n => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeICSText(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

let uidCounter = 0;
function generateUID() {
  uidCounter += 1;
  return `hcmus-slot-${Date.now()}-${uidCounter}@hcmus-schedule-bookmarklet`;
}

export class ICSExporter {
  /**
   * @param {import("../models/Schedule.js").Schedule} schedule
   * @returns {string} nội dung file .ics (RFC 5545)
   */
  export(schedule) {
    const events = [];

    for (const slot of schedule.getAllSlots()) {
      if (!slot.startDate) {
        console.warn(
          `⚠️ Bỏ qua "${slot.course.name}" [${slot.classGroup}] — ` +
          `không có ngày bắt đầu (startDate = null), không thể tính RRULE.`
        );
        continue;
      }

      for (const entry of slot.entries) {
        const clockRange = periodsToClockRange(slot.sessionType, entry.startPeriod, entry.endPeriod);
        if (!clockRange) {
          console.warn(
            `⚠️ Bỏ qua 1 buổi của "${slot.course.name}" [${slot.classGroup}] — ` +
            `không quy đổi được giờ cho tiết ${entry.startPeriod}-${entry.endPeriod}.`
          );
          continue;
        }
        const [startClock, endClock] = clockRange;

        const firstOccurrence = nextOrSameWeekday(slot.startDate, entry.dayOfWeek);
        const dtStart = toICSDateTimeUTC(firstOccurrence, startClock);
        const dtEnd = toICSDateTimeUTC(firstOccurrence, endClock);

        const locationParts = [entry.room, entry.campus].filter(Boolean);
        const location = locationParts.join(", ");

        events.push(
          [
            "BEGIN:VEVENT",
            `UID:${generateUID()}`,
            `DTSTAMP:${toICSDateTimeUTC(new Date(), "00:00")}`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            `RRULE:FREQ=WEEKLY;COUNT=${SEMESTER_WEEKS}`,
            `SUMMARY:${escapeICSText(`${slot.course.name} (${slot.sessionType})`)}`,
            location ? `LOCATION:${escapeICSText(location)}` : null,
            `DESCRIPTION:${escapeICSText(`${slot.course.code} - Lớp/Nhóm: ${slot.classGroup}`)}`,
            "END:VEVENT",
          ].filter(Boolean).join("\r\n")
        );
      }
    }

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//hcmus-schedule-bookmarklet//VI",
      "CALSCALE:GREGORIAN",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");
  }

  download(icsString, filename = "hcmus-schedule.ics") {
    const blob = new Blob([icsString], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
