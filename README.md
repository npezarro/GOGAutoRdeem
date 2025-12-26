# GOG Auto-Redeem Script
To expedite redeeming keys on GoG via the gog.com/redeem route (when key has been pre-filled)

A lightweight Tampermonkey user script that automates the game redemption process on GOG.com. It automatically detects and clicks the **Continue** and **Redeem** buttons on key redemption pages, saving you unnecessary clicks.

## Features

* **Zero-Config:** Works immediately upon installation.
* **Intelligent Polling:** Automatically detects when buttons load dynamically (specifically designed for GOG's Angular-based interface).
* **Dual Action:** Handles both the initial "Continue" confirmation and the final "Redeem" execution.

## Installation

1.  Install a user script manager extension for your browser:
    * [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
    * Violentmonkey
2.  Create a new script in your extension dashboard.
3.  Copy and paste the script code.
4.  Save the script (`File` > `Save` or `Ctrl+S`).

## How It Works

1.  Navigate to a GOG redemption URL (e.g., `https://www.gog.com/redeem/CODE123`).
2.  The script scans the page DOM every 500ms.
3.  When the **Continue** button renders, the script clicks it.
4.  When the **Redeem** button renders on the subsequent screen, the script clicks it.

## ⚠️ Important Note: reCAPTCHA

GOG occasionally triggers a reCAPTCHA challenge during the redemption process, especially if you redeem multiple codes in quick succession or if you are on a new network.

**This script cannot bypass reCAPTCHA.**

* If a reCAPTCHA appears, the script will naturally wait (as the "Redeem" button is usually hidden or disabled until the captcha is solved).
* **Manual Action Required:** You must manually solve the captcha. Once solved, the script will detect that the button is now actionable and proceed with the click automatically.

## Disclaimer

This script is for personal convenience only. Use it responsibly. This project is not affiliated with, endorsed by, or connected to GOG.com.
