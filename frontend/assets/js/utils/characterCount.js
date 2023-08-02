export function countCharacters() {
  const maxCharCount = 1000;

  const charCountSpan = document.querySelector(".character-count");
  const textarea = document.querySelector(".input-content");

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
