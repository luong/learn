'use strict';
const share = document.getElementById('share');
const notice = document.getElementById('share-status');
let noticeTimer;
share.addEventListener('click', async () => {
  const url = 'https://luong.github.io/learn/';
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    else {
      const input = document.createElement('textarea');
      input.value = url; input.setAttribute('aria-label','Tools for Coding page link'); input.style.position = 'fixed'; input.style.opacity = '0';
      document.body.append(input); input.select();
      const copied = document.execCommand('copy'); input.remove(); share.focus();
      if (!copied) throw Error('Copy unavailable');
    }
    notice.textContent = 'Link copied. Invite a friend to try it!';
  } catch { notice.textContent = 'Share this link: ' + url; }
  notice.hidden = false; clearTimeout(noticeTimer); noticeTimer = setTimeout(() => notice.hidden = true,5000);
});
