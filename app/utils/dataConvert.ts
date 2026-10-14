// Khmer numerals mapping
const khmerNumbers = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

// Convert English date to Khmer format
export const convertToKhmerDate = (dateString: string): string => {
  if (!dateString) return "";

  return dateString
    .split("")
    .map((char) => (/[0-9]/.test(char) ? khmerNumbers[parseInt(char)] : char))
    .join("");
};
