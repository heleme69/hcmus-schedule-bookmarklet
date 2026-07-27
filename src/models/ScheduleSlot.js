export class ScheduleSlot {
  /**
   * @param {object} params
   * @param {import("./Course.js").Course} params.course
   * @param {string} params.classGroup   "Lớp/Nhóm", vd: "24_HE1" hoặc "1"
   * @param {"LT"|"TH"} params.sessionType
   * @param {Date|null} params.startDate  ngày bắt đầu học (cột "Tuần bắt đầu")
   * @param {import("./ScheduleEntry.js").ScheduleEntry[]} params.entries
   */
  constructor({ course, classGroup, sessionType, startDate, entries }) {
    this.course = course;
    this.classGroup = classGroup;
    this.sessionType = sessionType;
    this.startDate = startDate;
    this.entries = entries;
  }

  /** Kiểm tra slot này có buổi nào trùng giờ với slot khác không */
  overlapsWith(otherSlot) {
    return this.entries.some(e =>
      otherSlot.entries.some(oe => e.overlapsWith(oe))
    );
  }
}