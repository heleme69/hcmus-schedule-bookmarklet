import { Course } from "../models/Course.js";
import { ScheduleEntry } from "../models/ScheduleEntry.js";
import { ScheduleSlot } from "../models/ScheduleSlot.js";

const DAY_CODE_TO_JS_DAY = {
  CN: 0, T2: 1, T3: 2, T4: 3, T5: 4, T6: 5, T7: 6,
};

/**
 * Parse 1 ô "Lịch Học", vd:
 *   "T6(1-4)-P.cs2:E104; T4(1-4)-P.cs2:F104"
 *   "T6(6-10)-P.Trực tuyến; T7(6-10)-P.E204"
 *   "T7(1-5)"   (không có phòng)
 * → mảng ScheduleEntry.
 */
function parseLichHoc(raw) {
  if (!raw || !raw.trim()) return [];

  return raw.split(";").map(part => part.trim()).filter(Boolean).map(part => {
    const match = part.match(/^(T\d|CN)\((\d+)-(\d+)\)(?:-P\.(.+))?$/);
    if (!match) {
      console.warn(`⚠️ Không parse được cụm lịch học: "${part}"`);
      return null;
    }
    const [, dayCode, startPeriod, endPeriod, campusRoom] = match;

    let campus = null;
    let room = null;
    if (campusRoom) {
      if (campusRoom.includes(":")) {
        [campus, room] = campusRoom.split(":").map(s => s.trim());
      } else if (campusRoom.trim() === "Trực tuyến") {
        campus = "Trực tuyến";
      } else {
        room = campusRoom.trim();
      }
    }

    return new ScheduleEntry({
      dayOfWeek: DAY_CODE_TO_JS_DAY[dayCode],
      startPeriod: Number(startPeriod),
      endPeriod: Number(endPeriod),
      campus,
      room,
    });
  }).filter(Boolean);
}

/** Parse "dd/mm/yyyy" -> Date, hoặc null nếu rỗng */
function parseVNDate(str) {
  if (!str || !str.trim()) return null;
  const [d, m, y] = str.trim().split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

/* ------------------------------------------------------------
 * BasePortalParser — lớp trừu tượng (JS không có `abstract`
 * keyword nên giả lập bằng throw Error nếu chưa override).
 * ------------------------------------------------------------ */
export class BasePortalParser {
  parse() {
    throw new Error("parse() phải được implement bởi lớp con!");
  }
}

/* ------------------------------------------------------------
 * HTMLPortalParser — đọc bảng #tbSVKQ trong trang
 * "Kết Quả Đăng Ký Học Phần" của portal HCMUS.
 * ------------------------------------------------------------ */
export class HTMLPortalParser extends BasePortalParser {
  constructor(rootElement = document) {
    super();
    this.rootElement = rootElement;
  }

  parse() {
    const table = this.rootElement.querySelector("#tbSVKQ");
    if (!table) {
      throw new Error("Không tìm thấy bảng #tbSVKQ — có đang ở đúng trang Kết Quả ĐKHP không?");
    }

    const rows = table.querySelectorAll("tbody tr");
    const slots = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 6) return;

      const text = i => cells[i].textContent.replace(/\s+/g, " ").trim();

      const courseCode = text(0);
      const courseName = text(1);
      const classGroup = text(2);
      // cells[3] = "Loại ĐK" — không cần cho việc xuất lịch
      const sessionType = text(4); // "LT" | "TH"
      const lichHocRaw = text(5);
      const startDateRaw = cells[6] ? text(6) : "";

      const course = new Course(courseCode, courseName, null);
      const entries = parseLichHoc(lichHocRaw);

      if (entries.length === 0) {
        console.warn(`⚠️ Bỏ qua "${courseName}" (${classGroup}) — không có lịch học cụ thể.`);
        return;
      }

      slots.push(new ScheduleSlot({
        course,
        classGroup,
        sessionType,
        startDate: parseVNDate(startDateRaw),
        entries,
      }));
    });

    return slots;
  }
}
