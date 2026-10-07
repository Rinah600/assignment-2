const { lengthOfLongestSubstring } = require('./lengthOfLongestSubstring');

const cases = [
  ['abcabcbb', 3], // "abc"
  ['bbbbb', 1],    // "b"
  ['pwwkew', 3],   // "wke"
  ['', 0],
  [' ', 1],
  ['abba', 2],     // checks that left never moves backwards
  ['dvdf', 3],     // "vdf"
];

let failed = 0;
for (const [input, expected] of cases) {
  const actual = lengthOfLongestSubstring(input);
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  lengthOfLongestSubstring("${input}") = ${actual} (expected ${expected})`);
}
process.exit(failed ? 1 : 0);
