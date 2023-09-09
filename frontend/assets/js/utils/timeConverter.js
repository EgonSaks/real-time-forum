export function convertTime(inputDateString) {
  const date = new Date(inputDateString);

  const timeOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const timeString = date.toLocaleString("en-US", timeOptions);

  const dateOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const dateString = date.toLocaleString("en-US", dateOptions);

  return `${timeString} ${dateString}`;
}

export function formatLastSeen(lastSeen) {
  const now = new Date();
  const seenTime = new Date(lastSeen);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const timeDiff = Math.floor((now - seenTime) / 1000);

  // If it's less than 1 hour
  if (timeDiff < 60) {
    const minutes = Math.floor(timeDiff / 60);
    return `${minutes} min`;
  }

  // If it's the same day
  if (seenTime.toDateString() === now.toDateString()) {
    const hours = seenTime.getHours();
    const minutes = seenTime.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${minutes < 10 ? "0" : ""}${minutes} ${ampm}`;
  }

  // If it's the same week
  const daysDiff = Math.floor(timeDiff / (24 * 3600));
  if (daysDiff >= 0 && daysDiff < 7 && seenTime <= now) {
    return days[seenTime.getDay()];
  }

  // If it's the same year
  if (seenTime.getFullYear() === now.getFullYear()) {
    const month = months[seenTime.getMonth()];
    const dayOfMonth = seenTime.getDate();
    return `${month} ${dayOfMonth}`;
  }

  // Past year
  const year = seenTime.getFullYear();
  const month = months[seenTime.getMonth()];
  const dayOfMonth = seenTime.getDate();
  return `${month} ${dayOfMonth}, ${year}`;
}
