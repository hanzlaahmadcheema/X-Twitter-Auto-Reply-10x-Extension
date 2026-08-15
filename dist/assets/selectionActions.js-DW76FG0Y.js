import{t as e}from"./rolldown-runtime-D9-fqq9M.js";var t=e((()=>{(function(){function e(){try{return typeof chrome<`u`&&!!(chrome.runtime&&chrome.runtime.id)}catch{return!1}}window.addEventListener(`error`,e=>{e?.message?.includes(`Extension context invalidated`)&&(e.preventDefault(),e.stopImmediatePropagation())},!0),window.addEventListener(`unhandledrejection`,e=>{String(e?.reason).includes(`Extension context invalidated`)&&(e.preventDefault(),e.stopImmediatePropagation())},!0);let t=null,n=``,r=null,i=!1,a=null,o={main:`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`,copy:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,improve:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M10.55 3c-3.852.007-5.87.102-7.159 1.39C2 5.783 2 8.022 2 12.5s0 6.717 1.391 8.109C4.783 22 7.021 22 11.501 22c4.478 0 6.717 0 8.108-1.391c1.29-1.29 1.384-3.307 1.391-7.16"/><path d="M11.056 13C10.332 3.866 16.802 1.276 21.98 2.164c.209 3.027-1.273 4.16-4.093 4.684c.545.57 1.507 1.286 1.403 2.18c-.074.638-.506.95-1.372 1.576c-1.896 1.37-4.093 2.234-6.863 2.396"/><path d="M9 17c2-5.5 3.96-7.364 6-9"/></g></svg>`,translate:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g fill="currentColor"><path d="M4.545 6.714L4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z"/><path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292c.178.217.451.635.555.867c1.125-.359 2.08-.844 2.886-1.494c.777.665 1.739 1.165 2.93 1.472c.133-.254.414-.673.629-.89c-1.125-.253-2.057-.694-2.82-1.284c.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492a2 2 0 0 1-.94.31"/></g></svg>`,replace:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3L21 7L17 11"></path><path d="M3 13V11C3 7.68629 5.68629 5 9 5H21"></path><polyline points="7 21 3 17 7 13"></polyline><path d="M21 11V13C21 16.3137 18.3137 19 15 19H3"></path></svg>`,close:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,check:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`};function s(){let e=document.createElement(`style`);e.textContent=`
    #selection-action-container {
      position: absolute;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: none;
      background: white;
      border-radius: 9999px;
      padding: 4px 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      border: 1px solid #e1e8ed;
      align-items: center;
      gap: 4px;
      flex-direction: row;
    }
    [data-theme="dark"] #selection-action-container {
      background: #000000;
      border-color: #333639;
      color: #eff3f4;
    }
    
    .action-item {
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.2s;
      position: relative;
    }
    .action-item:hover { background: rgba(29, 161, 242, 0.1); }
    .action-item svg { color: #1da1f2; stroke-width: 2.5; }
    
    /* Tooltip */
    .action-item::after {
      content: attr(data-label);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(-8px);
      background: #333;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      margin-bottom: 4px;
    }
    .action-item:hover::after { opacity: 1; }
    [data-theme="dark"] .action-item::after { background: #eff3f4; color: #000; }

    .result-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 450px;
      max-width: 90vw;
      z-index: 2147483647;
      display: none;
      flex-direction: column;
      border: 1px solid #e1e8ed;
      color: #0f1419;
    }
    [data-theme="dark"] .result-popup {
      background: #000000;
      border-color: #333639;
      color: #eff3f4;
    }
    .popup-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e1e8ed;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 800;
      font-size: 16px;
    }
    [data-theme="dark"] .popup-header { border-color: #333639; }
    .popup-content {
      padding: 20px;
      max-height: 400px;
      overflow-y: auto;
      font-size: 15px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .popup-footer {
      padding: 12px 16px;
      border-top: 1px solid #e1e8ed;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    [data-theme="dark"] .popup-footer { border-color: #333639; }
    .popup-btn {
      padding: 10px 20px;
      border-radius: 9999px;
      border: 1px solid #cfd9de;
      background: white;
      color: #0f1419;
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    [data-theme="dark"] .popup-btn {
      background: transparent;
      border-color: #536471;
      color: #eff3f4;
    }
    .popup-btn.primary {
      background: #1da1f2;
      color: white;
      border: none;
    }
    .popup-btn.primary:hover { background: #1a8cd8; }
    .popup-btn:not(.primary):hover { background: rgba(15, 20, 25, 0.1); }
    [data-theme="dark"] .popup-btn:not(.primary):hover { background: rgba(239, 243, 244, 0.1); }
    
    .loading-spinner {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 3px solid rgba(29, 161, 242, 0.2);
      border-top-color: #1da1f2;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `,document.head.appendChild(e)}function c(){let e=document.createElement(`div`);e.id=`selection-action-container`,[{id:`copy`,label:`Copy`,icon:o.copy},{id:`improve`,label:`Improve Writing`,icon:o.improve},{id:`translate`,label:`Translate to Urdu`,icon:o.translate}].forEach(t=>{let n=document.createElement(`div`);n.className=`action-item`,n.setAttribute(`data-label`,t.label),n.innerHTML=t.icon,n.onclick=e=>{e.stopPropagation(),l(t.id)},e.appendChild(n)}),document.body.appendChild(e),t=document.createElement(`div`),t.className=`result-popup`,document.body.appendChild(t)}async function l(t){if(m(),t===`copy`){d(n),m();return}if(u(`Processing...`,!0),!e()){u(`Extension context reloaded. Please refresh the page.`,!1);return}try{chrome.runtime.sendMessage({action:`generateReply`,selectionAction:t===`improve`?`improve`:`translate_urdu`,text:n},e=>{e&&e.reply?(u(e.reply,!1,t),d(e.reply,!1)):u(`Error: `+(e?.error||`Failed to generate response`),!1)})}catch{u(`Extension updated. Please refresh the page.`,!1)}}function u(e,n,r){let a=i,s=``;n||(s=`
        <button class="popup-btn" id="popup-copy-btn">${o.copy} Copy</button>
        ${a?`<button class="popup-btn primary" id="popup-replace-btn">${o.replace} Replace</button>`:``}
        <button class="popup-btn" id="popup-close-btn">Close</button>
      `),t.innerHTML=`
      <div class="popup-header">
        <span>${n?`Thinking...`:r===`improve`?`Improved Writing`:`Urdu Translation`}</span>
        <div id="popup-header-close" style="cursor:pointer">${o.close}</div>
      </div>
      <div class="popup-content">
        ${n?`<div style="text-align:center; padding: 20px;"><div class="loading-spinner"></div></div>`:e}
      </div>
      <div class="popup-footer">
        ${s}
      </div>
    `,t.style.display=`flex`,document.getElementById(`popup-header-close`).onclick=()=>t.style.display=`none`,n||(document.getElementById(`popup-copy-btn`).onclick=()=>d(e),document.getElementById(`popup-close-btn`).onclick=()=>t.style.display=`none`,a&&(document.getElementById(`popup-replace-btn`).onclick=()=>{f(e),t.style.display=`none`,m()}))}async function d(e,t=!0){try{if(await navigator.clipboard.writeText(e),t){let e=document.getElementById(`popup-copy-btn`);if(e){let t=e.innerHTML;e.innerHTML=`${o.check} Copied!`,setTimeout(()=>e.innerHTML=t,2e3)}}}catch(e){console.error(`Failed to copy: `,e)}}function f(e){if(!(!r&&!a)){if(a&&(a.tagName===`INPUT`||a.tagName===`TEXTAREA`)){let t=a.selectionStart,n=a.selectionEnd,r=a.value;a.value=r.slice(0,t)+e+r.slice(n),a.selectionStart=a.selectionEnd=t+e.length,a.dispatchEvent(new Event(`input`,{bubbles:!0})),a.focus()}else if(r){let t=window.getSelection();t.removeAllRanges(),t.addRange(r),document.execCommand(`insertText`,!1,e)}}}function p(){let e=window.getSelection(),t=e.toString().trim();if(!t||t.length<2){m();return}n=t,a=document.activeElement,i=a&&(a.isContentEditable||a.tagName===`INPUT`||a.tagName===`TEXTAREA`);let o=e.getRangeAt(0);r=o.cloneRange();let s=o.getBoundingClientRect(),c=document.getElementById(`selection-action-container`);c.style.display=`block`;let l=window.pageXOffset||document.documentElement.scrollLeft,u=window.pageYOffset||document.documentElement.scrollTop;c.style.display=`flex`,c.style.left=`${s.left+l+s.width/2}px`,c.style.top=`${s.top+u-45}px`,c.style.transform=`translateX(-50%)`,s.top<50&&(c.style.top=`${s.bottom+u+10}px`);let d=c.getBoundingClientRect();d.left<10?c.style.left=`${l+d.width/2+10}px`:d.right>window.innerWidth-10&&(c.style.left=`${window.innerWidth-d.width/2-10+l}px`)}function m(){let e=document.getElementById(`selection-action-container`);e&&(e.style.display=`none`)}function h(){let e=window.matchMedia&&window.matchMedia(`(prefers-color-scheme: dark)`).matches,t=document.body.style.backgroundColor===`rgb(0, 0, 0)`||document.body.style.backgroundColor===`rgb(21, 32, 43)`||document.documentElement.getAttribute(`data-tw-theme`)===`dark`;e||t?document.documentElement.setAttribute(`data-theme`,`dark`):document.documentElement.setAttribute(`data-theme`,`light`)}s(),c(),h(),document.addEventListener(`mouseup`,()=>{setTimeout(p,10)}),document.addEventListener(`mousedown`,e=>{let n=document.getElementById(`selection-action-container`);n&&!n.contains(e.target)&&t&&!t.contains(e.target)&&m()})})()}));export default t();