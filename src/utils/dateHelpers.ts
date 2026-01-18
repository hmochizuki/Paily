export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const hours = d.getHours();
    const minutes = d.getMinutes();
    return `今日 ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  } else if (diffDays === 1) {
    return "昨日";
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}週間前`;
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  } else {
    return `${Math.floor(diffDays / 365)}年前`;
  }
}