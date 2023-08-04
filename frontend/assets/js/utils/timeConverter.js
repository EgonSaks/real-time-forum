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
