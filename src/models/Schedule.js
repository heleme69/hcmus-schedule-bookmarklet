export class Schedule {
	#slots = [];

	/**
	 * @param {import("./ScheduleSlot.js").ScheduleSlot} newSlot
	 */
	addSlot(newSlot) {
		const conflict = this.#slots.find(slot => slot.overlapsWith(newSlot));
		if (conflict) {
	      	console.warn(
	        `⚠️ Trùng lịch: ${newSlot.course.name} (${newSlot.classGroup}) ` +
	        `vs ${conflict.course.name} (${conflict.classGroup})`
	      	);
    	}
    this.#slots.push(newSlot);
	}

  	getAllSlots() {
    return [...this.#slots]; 
  	}

	get size() {
	return this.#slots.length;
	}
}