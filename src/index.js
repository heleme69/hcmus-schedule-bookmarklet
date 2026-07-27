import { Schedule } from "./models/Schedule.js";
import { HTMLPortalParser } from "./services/PortalParser.js";
import { ICSExporter } from "./services/ICSExporter.js";

function run() {
  const parser = new HTMLPortalParser(document);
  const schedule = new Schedule();

  parser.parse().forEach(slot => schedule.addSlot(slot));
  console.log(`Đã parse được ${schedule.size} lớp học.`);

  injectDownloadButton(schedule);
}

/** Chèn 1 nút "Tải lịch (.ics)" vào đầu trang, kiểu GPABookmarklet */
function injectDownloadButton(schedule) {
  const btn = document.createElement("button");
  btn.textContent = `📅 Tải lịch (.ics) — ${schedule.size} lớp`;
  btn.style.cssText =
    "position:fixed;top:10px;right:10px;z-index:99999;" +
    "padding:10px 16px;background:#2563eb;color:#fff;border:none;" +
    "border-radius:8px;cursor:pointer;font-size:14px;";

  btn.addEventListener("click", () => {
    try {
      const exporter = new ICSExporter();
      const icsString = exporter.export(schedule);
      exporter.download(icsString);
    } catch (err) {
      alert("Chưa xuất được lịch: " + err.message);
      console.error(err);
    }
  });

  document.body.appendChild(btn);
}

run();
