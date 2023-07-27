export function convertTime(inputDateString) {
  // Convert the input string to a Date object
  const date = new Date(inputDateString);

  // Format the time
  const timeOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // Use 12-hour format (AM/PM)
  };
  const timeString = date.toLocaleString("en-US", timeOptions);

  // Format the date
  const dateOptions = {
    month: "long", // Use "long" to get the full month name
    day: "numeric",
    year: "numeric",
  };
  const dateString = date.toLocaleString("en-US", dateOptions);

  return `${timeString} ${dateString}`;
}
