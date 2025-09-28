const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateInviteCode(length = 6): string {
  if (length < 4 || length > 12) {
    throw new Error("Invite code length must be between 4 and 12 characters");
  }

  let result = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i += 1) {
    result += LETTERS[array[i] % LETTERS.length];
  }
  return result;
}

export const INVITE_CODE_REGEX = /^[A-Z]{4,12}$/;
