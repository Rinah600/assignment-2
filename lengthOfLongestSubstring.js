// Sliding window: the window [left, right] never contains a repeated character.
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map(); // character -> index where we last saw it
  let left = 0;               // start of the current window
  let best = 0;               // longest window length so far

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];

    // If ch already appears inside the window, move left just past that earlier copy.
    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) {
      left = lastSeen.get(ch) + 1;
    }

    lastSeen.set(ch, right);                 // remember the newest position of ch
    best = Math.max(best, right - left + 1); // window length = right - left + 1
  }

  return best;
}

module.exports = { lengthOfLongestSubstring };
