# Longest Substring Without Repeating Characters

`lengthOfLongestSubstring(s)` returns the length of the longest substring of `s` with no repeated characters.

**Code walkthrough video (5 min):** ADD_YOUR_PUBLIC_VIDEO_URL_HERE

## Run
```bash
node test.js
```

## Approach: sliding window
Two pointers, `left` and `right`, mark a window that never contains a repeat. A `Map` stores the last index of each character. When the new character is already inside the window, `left` jumps just past its earlier copy. The answer is the largest window seen.

- Time: O(n), each character is visited once
- Space: O(k), where k is the number of distinct characters
## video demo
Public URL: https://youtu.be/gT5m6kRd_F8