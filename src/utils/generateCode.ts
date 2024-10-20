export function generateVerifyCode() {
  const numbers = "0123456789";
  const alphabets = "abcdefghijklmnopqrstuvwxyz";

  const mix = numbers + alphabets;

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += mix.charAt(Math.floor(Math.random() * mix.length));
  }

  return code;
}
