const hijriMonthNames = [
  '????', '???', '???? ?????', '???? ?????',
  '????? ??????', '????? ??????', '???', '?????',
  '?????', '????', '?? ??????', '?? ?????',
];

function gregorianToJulianDay(year, month, day) {
  const y = year;
  const m = month + 1;
  const d = day;
  if (m <= 2) { year = y - 1; month = m + 12; } else { year = y; month = m; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + d + B - 1524.5;
}

export function getHijriDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const jd = gregorianToJulianDay(year, month, day);
  const hijriEpoch = 1948439.5;
  const daysSinceEpoch = Math.floor(jd - hijriEpoch);
  const hijriYear = Math.floor((daysSinceEpoch / 29.530588) / 12) + 1;
  const monthDays = Math.floor(daysSinceEpoch - (hijriYear - 1) * 354.36707);

  let hijriMonth = 0;
  let daysRemaining = monthDays;
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  for (let i = 0; i < 12; i++) {
    if (daysRemaining <= monthLengths[i]) {
      hijriMonth = i;
      break;
    }
    daysRemaining -= monthLengths[i];
  }

  const hijriDay = Math.floor(daysRemaining);
  return { day: hijriDay, month: hijriMonthNames[hijriMonth], year: String(hijriYear) };
}

export function estimateGregorianDate(hijriYear, hijriMonth) {
  const gYearApprox = Math.floor(hijriYear * 0.970229 + 621.5774);
  const dayOfYear = Math.floor(hijriMonth * 29.5) + 1;
  const estDate = new Date(gYearApprox, 0, 1);
  estDate.setDate(dayOfYear);
  return estDate;
}
