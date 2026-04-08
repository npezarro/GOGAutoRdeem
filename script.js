// ==UserScript==
// @name         GOG Auto-Redeem
// @namespace    https://github.com/npezarro/GOGAutoRdeem
// @version      1.0
// @description  Automatically clicks Continue and Redeem buttons on GOG.com key redemption pages
// @author       npezarro
// @match        https://www.gog.com/redeem*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/npezarro/GOGAutoRdeem/main/script.js
// @downloadURL  https://raw.githubusercontent.com/npezarro/GOGAutoRdeem/main/script.js
// ==/UserScript==

(function () {
    'use strict';

    const POLL_INTERVAL = 500;
    const MAX_POLLS = 120; // 60 seconds max wait
    const LOG_PREFIX = '[GOG Auto-Redeem]';

    let clickedContinue = false;
    let clickedRedeem = false;
    let pollCount = 0;

    function log(msg) {
        console.log(`${LOG_PREFIX} ${msg}`);
    }

    function findButtonByText(text) {
        const buttons = document.querySelectorAll('button, [role="button"], a.btn, input[type="submit"]');
        for (const btn of buttons) {
            const btnText = (btn.textContent || btn.value || '').trim().toLowerCase();
            if (btnText === text.toLowerCase() && !btn.disabled && btn.offsetParent !== null) {
                return btn;
            }
        }
        return null;
    }

    function poll() {
        pollCount++;

        if (pollCount > MAX_POLLS) {
            log('Max poll limit reached, stopping.');
            return;
        }

        if (!clickedContinue) {
            const continueBtn = findButtonByText('continue');
            if (continueBtn) {
                log('Found "Continue" button, clicking...');
                continueBtn.click();
                clickedContinue = true;
            }
        }

        if (clickedContinue && !clickedRedeem) {
            const redeemBtn = findButtonByText('redeem');
            if (redeemBtn) {
                log('Found "Redeem" button, clicking...');
                redeemBtn.click();
                clickedRedeem = true;
                log('Redemption complete!');
                return;
            }
        }

        if (!clickedRedeem) {
            setTimeout(poll, POLL_INTERVAL);
        }
    }

    log('Script loaded, starting poll...');
    poll();
})();
