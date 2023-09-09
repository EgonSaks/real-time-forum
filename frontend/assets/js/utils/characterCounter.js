export function countCharacters(charCountSpan, textarea, maxCharCount) {

  const text = textarea.value;
  const charCount = text.length;

  charCountSpan.textContent =
    charCount > maxCharCount
      ? `-${charCount - maxCharCount}`
      : `${maxCharCount - charCount}`;

  if (charCount >= maxCharCount - 5) {
    charCountSpan.classList.add("red");
  } else {
    charCountSpan.classList.remove("red");
  }
}
