import{t as e}from"./rolldown-runtime-D9-fqq9M.js";var t=e((()=>{(function(){let e=null,t=``,n=null,r=!1,i=null,a={main:`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`,copy:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,improve:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M10.55 3c-3.852.007-5.87.102-7.159 1.39C2 5.783 2 8.022 2 12.5s0 6.717 1.391 8.109C4.783 22 7.021 22 11.501 22c4.478 0 6.717 0 8.108-1.391c1.29-1.29 1.384-3.307 1.391-7.16"/><path d="M11.056 13C10.332 3.866 16.802 1.276 21.98 2.164c.209 3.027-1.273 4.16-4.093 4.684c.545.57 1.507 1.286 1.403 2.18c-.074.638-.506.95-1.372 1.576c-1.896 1.37-4.093 2.234-6.863 2.396"/><path d="M9 17c2-5.5 3.96-7.364 6-9"/></g></svg>`,translate:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g fill="currentColor"><path d="M4.545 6.714L4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z"/><path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292c.178.217.451.635.555.867c1.125-.359 2.08-.844 2.886-1.494c.777.665 1.739 1.165 2.93 1.472c.133-.254.414-.673.629-.89c-1.125-.253-2.057-.694-2.82-1.284c.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492a2 2 0 0 1-.94.31"/></g></svg>`,replace:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3L21 7L17 11"></path><path d="M3 13V11C3 7.68629 5.68629 5 9 5H21"></path><polyline points="7 21 3 17 7 13"></polyline><path d="M21 11V13C21 16.3137 18.3137 19 15 19H3"></path></svg>`,close:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,check:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`};function o(){let e=document.createElement(`style`);e.textContent=`
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
  `,document.head.appendChild(e)}function s(){let t=document.createElement(`div`);t.id=`selection-action-container`,[{id:`copy`,label:`Copy`,icon:a.copy},{id:`improve`,label:`Improve Writing`,icon:a.improve},{id:`translate`,label:`Translate to Urdu`,icon:a.translate}].forEach(e=>{let n=document.createElement(`div`);n.className=`action-item`,n.setAttribute(`data-label`,e.label),n.innerHTML=e.icon,n.onclick=t=>{t.stopPropagation(),c(e.id)},t.appendChild(n)}),document.body.appendChild(t),e=document.createElement(`div`),e.className=`result-popup`,document.body.appendChild(e)}async function c(e){if(p(),e===`copy`){u(t),p();return}l(`Processing...`,!0),chrome.runtime.sendMessage({action:`generateReply`,selectionAction:e===`improve`?`improve`:`translate_urdu`,text:t},t=>{t&&t.reply?(l(t.reply,!1,e),u(t.reply,!1)):l(`Error: `+(t?.error||`Failed to generate response`),!1)})}function l(t,n,i){let o=r,s=``;n||(s=`
        <button class="popup-btn" id="popup-copy-btn">${a.copy} Copy</button>
        ${o?`<button class="popup-btn primary" id="popup-replace-btn">${a.replace} Replace</button>`:``}
        <button class="popup-btn" id="popup-close-btn">Close</button>
      `),e.innerHTML=`
      <div class="popup-header">
        <span>${n?`Thinking...`:i===`improve`?`Improved Writing`:`Urdu Translation`}</span>
        <div id="popup-header-close" style="cursor:pointer">${a.close}</div>
      </div>
      <div class="popup-content">
        ${n?`<div style="text-align:center; padding: 20px;"><div class="loading-spinner"></div></div>`:t}
      </div>
      <div class="popup-footer">
        ${s}
      </div>
    `,e.style.display=`flex`,document.getElementById(`popup-header-close`).onclick=()=>e.style.display=`none`,n||(document.getElementById(`popup-copy-btn`).onclick=()=>u(t),document.getElementById(`popup-close-btn`).onclick=()=>e.style.display=`none`,o&&(document.getElementById(`popup-replace-btn`).onclick=()=>{d(t),e.style.display=`none`,p()}))}async function u(e,t=!0){try{if(await navigator.clipboard.writeText(e),t){let e=document.getElementById(`popup-copy-btn`);if(e){let t=e.innerHTML;e.innerHTML=`${a.check} Copied!`,setTimeout(()=>e.innerHTML=t,2e3)}}}catch(e){console.error(`Failed to copy: `,e)}}function d(e){if(!(!n&&!i)){if(i&&(i.tagName===`INPUT`||i.tagName===`TEXTAREA`)){let t=i.selectionStart,n=i.selectionEnd,r=i.value;i.value=r.slice(0,t)+e+r.slice(n),i.selectionStart=i.selectionEnd=t+e.length,i.dispatchEvent(new Event(`input`,{bubbles:!0})),i.focus()}else if(n){let t=window.getSelection();t.removeAllRanges(),t.addRange(n),document.execCommand(`insertText`,!1,e)}}}function f(){let e=window.getSelection(),a=e.toString().trim();if(!a||a.length<2){p();return}t=a,i=document.activeElement,r=i&&(i.isContentEditable||i.tagName===`INPUT`||i.tagName===`TEXTAREA`);let o=e.getRangeAt(0);n=o.cloneRange();let s=o.getBoundingClientRect(),c=document.getElementById(`selection-action-container`);c.style.display=`block`;let l=window.pageXOffset||document.documentElement.scrollLeft,u=window.pageYOffset||document.documentElement.scrollTop;c.style.display=`flex`,c.style.left=`${s.left+l+s.width/2}px`,c.style.top=`${s.top+u-45}px`,c.style.transform=`translateX(-50%)`,s.top<50&&(c.style.top=`${s.bottom+u+10}px`);let d=c.getBoundingClientRect();d.left<10?c.style.left=`${l+d.width/2+10}px`:d.right>window.innerWidth-10&&(c.style.left=`${window.innerWidth-d.width/2-10+l}px`)}function p(){let e=document.getElementById(`selection-action-container`);e&&(e.style.display=`none`)}function m(){let e=window.matchMedia&&window.matchMedia(`(prefers-color-scheme: dark)`).matches,t=document.body.style.backgroundColor===`rgb(0, 0, 0)`||document.body.style.backgroundColor===`rgb(21, 32, 43)`||document.documentElement.getAttribute(`data-tw-theme`)===`dark`;e||t?document.documentElement.setAttribute(`data-theme`,`dark`):document.documentElement.setAttribute(`data-theme`,`light`)}o(),s(),m(),document.addEventListener(`mouseup`,()=>{setTimeout(f,10)}),document.addEventListener(`mousedown`,t=>{let n=document.getElementById(`selection-action-container`);n&&!n.contains(t.target)&&e&&!e.contains(t.target)&&p()})})()}));export default t();