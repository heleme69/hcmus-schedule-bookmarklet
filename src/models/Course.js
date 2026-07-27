export class Course {
  constructor(code, name, credits = null) {
    this.code = code;       // Mã môn, vd: "MTH10407"
    this.name = name;       // Tên môn, vd: "Lập trình hướng đối tượng"
    this.credits = credits; // Số tín chỉ (portal ĐKHP không có cột này -> null)
  }

  toString() {
    return this.credits != null
      ? `${this.code} - ${this.name} (${this.credits} TC)`
      : `${this.code} - ${this.name}`;
  }
}
