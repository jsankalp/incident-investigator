import { DEMO_NOW_UTC } from "../constants";

function normalizeUtcTime(value: string, endOfMinute = false) {
  const hasDate = /^\d{4}-\d{2}-\d{2}[ T]/.test(value);
  const datePart = hasDate ? value.slice(0, 10) : DEMO_NOW_UTC.slice(0, 10);
  const timePart = hasDate ? value.slice(11) : value;
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes, secondsValue] = timePart.split(":").map(Number);
  const seconds = endOfMinute ? 59 : (secondsValue ?? 0);
  const utcDate = new Date(
    Date.UTC(
      year || new Date(DEMO_NOW_UTC).getUTCFullYear(),
      (month || new Date(DEMO_NOW_UTC).getUTCMonth() + 1) - 1,
      day || new Date(DEMO_NOW_UTC).getUTCDate(),
      hours,
      minutes,
      seconds
    )
  );

  const date = [
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth() + 1,
    utcDate.getUTCDate()
  ]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");
  const time = [
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds()
  ]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

  return `${date} ${time}`;
}

export function getUtcTimeRange(start: string, end: string) {
  return {
    startUtc: normalizeUtcTime(start),
    endUtc: normalizeUtcTime(end, true)
  };
}
