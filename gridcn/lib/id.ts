const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

interface GenerateIdOptions {
  length?: number;
  prefix?: string;
}

export function generateId({
  length = 8,
  prefix = "",
}: GenerateIdOptions = {}): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return `${prefix}${result}`;
}
