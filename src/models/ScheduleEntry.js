export class ScheduleEntry {
	constructor({ dayOfWeek, startPeriod, endPeriod, campus, room}) {
		this.dayOfWeek = dayOfWeek;
		this.startPeriod = startPeriod;
		this.endPeriod = endPeriod;
		this.campus = campus;
		this.room = room;
	}

	overlapsWith(otherEntry) {
    if (this.dayOfWeek !== otherEntry.dayOfWeek) return false;
    const noOverlap =
      this.endPeriod < otherEntry.startPeriod ||
      otherEntry.endPeriod < this.startPeriod;
    return !noOverlap;
  }
}