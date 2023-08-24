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

  const timeDiff = Math.floor((now - seenTime) / 1000);

  if (timeDiff < 60) {
    return `${timeDiff} sec ago`;
  } else if (timeDiff < 3600) {
    const minutes = Math.floor(timeDiff / 60);
    return `${minutes} min ago`;
  } else {
    const hours = Math.floor(timeDiff / 3600);
    return `${hours} hour ago`;
  }
}
