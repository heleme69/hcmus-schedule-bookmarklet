export const LT_PERIOD_CLOCK = {
  1: ["07:30", "08:20"],
  2: ["08:20", "09:10"],
  3: ["09:10", "10:00"], // sau tiết 3: nghỉ 10'
  4: ["10:10", "11:00"],
  5: ["11:00", "11:50"],
  6: ["12:40", "13:30"],
  7: ["13:30", "14:20"],
  8: ["14:20", "15:10"], // sau tiết 8: nghỉ 10'
  9: ["15:20", "16:10"],
  10: ["16:10", "17:00"],
};

const TH_CA_CLOCK = {
  ca1: ["07:30", "09:35"],
  ca2: ["09:45", "11:50"],
  ca3: ["12:40", "14:45"],
  ca4: ["14:55", "17:00"],
};

const TH_RANGE_TO_CA = {
  "1-5": ["ca1", "ca2"],  // cả buổi sáng
  "1-3": ["ca1", "ca1"],  // chỉ ca 1
  "3-5": ["ca2", "ca2"],  // chỉ ca 2 (bắt đầu "giữa tiết 3")
  "6-10": ["ca3", "ca4"], // cả buổi chiều
  "6-8": ["ca3", "ca3"],  // chỉ ca 3
  "8-10": ["ca4", "ca4"], // chỉ ca 4 (bắt đầu "giữa tiết 8")
};

/**
 * Quy đổi 1 khoảng tiết -> [giờ bắt đầu, giờ kết thúc] dạng "HH:mm".
 * @param {"LT"|"TH"} sessionType
 * @param {number} startPeriod
 * @param {number} endPeriod
 * @returns {[string, string]|null} null nếu không quy đổi được (cần xử lý thủ công)
 */
export function periodsToClockRange(sessionType, startPeriod, endPeriod) {
  if (sessionType === "LT") {
    const start = LT_PERIOD_CLOCK[startPeriod];
    const end = LT_PERIOD_CLOCK[endPeriod];
    if (!start || !end) {
      console.warn(`⚠️ Không tìm thấy giờ cho tiết LT ${startPeriod}-${endPeriod}`);
      return null;
    }
    return [start[0], end[1]];
  }

  if (sessionType === "TH") {
    const key = `${startPeriod}-${endPeriod}`;
    const caPair = TH_RANGE_TO_CA[key];
    if (!caPair) {
      console.warn(
        `⚠️ Khoảng tiết TH "${key}" không khớp ranh giới ca nào đã biết — ` +
        `cần bổ sung thủ công vào TH_RANGE_TO_CA.`
      );
      return null;
    }
    const [startCa, endCa] = caPair;
    return [TH_CA_CLOCK[startCa][0], TH_CA_CLOCK[endCa][1]];
  }

  console.warn(`⚠️ sessionType lạ: "${sessionType}"`);
  return null;
}
