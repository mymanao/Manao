<div align="center">
  <a href="https://github.com/mymanao/manao">
    <img src="https://raw.githubusercontent.com/mymanao/manao/main/docs/manao.svg" height="64px" width="auto" alt="Manao Logo" />
  </a>
  <h2>Manao</h2>
  <p>A collection of utilities and tools for Twitch and Kick streamers.</p>

<a href="https://hackatime-badge.hackclub.com/U096PDK4PL3/Manao"><img src="https://hackatime-badge.hackclub.com/U096PDK4PL3/Manao" alt="wakatime"></a>
<a href="https://github.com/mymanao/manao/pulse"><img src="https://img.shields.io/github/commit-activity/m/mymanao/manao" alt="commits" /></a>
<img src="https://img.shields.io/github/license/mymanao/manao" alt="license" />   
<img src="https://img.shields.io/github/languages/top/mymanao/manao" alt="top language" />
<a href="https://discord.gg/vkW7YMyYaf"><img src="https://img.shields.io/discord/964718161624715304" alt="discord" /></a>
<a href="/.github/CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg" alt="CoC" /></a>
<img src="https://img.shields.io/github/package-json/v/mymanao/manao" alt="version" />
</div>

---

## Table of Contents

- [🤔 About](#-about)
- [📖 Wiki & Documentation](#-wiki--documentation)
- [📍 Features](#-features)
  - [Chat Commands](#chat-commands)
  - [Overlays](#overlays)
  - [Entertainment & Audio](#entertainment--audio)
- [👋 Contributing & Community](#-contributing--community)
- [📜 License](#-license)
- [🙋‍♂️ FAQ & Troubleshooting](#-faq--troubleshooting)

---

## 🤔 About

Manao Bot is an open-source, multi-platform chatbot built for Twitch and Kick streamers. It provides out-of-the-box multilingual support (English and Thai) and integrates standard streamer utilities into a single application, eliminating the need to bridge multiple third-party bots.

**Security & Architecture:** Manao is entirely self-hosted. Your Twitch API credentials and broadcast tokens remain on your local machine and are never routed through external proprietary servers.

*Note: Manao operates with a Twitch-first architecture. Kick users can sync their accounts, but an active Twitch integration is structurally required and cannot be opted out of.*

---

## 📖 Wiki & Documentation

For comprehensive setup guides and API references, please visit our dedicated documentation site. Both English and Thai translations are fully supported.

* **Documentation Site:** [ManaoWiki](https://manaobot.netlify.app/)
* **Wiki Source Code:** [mymanao/manao-wiki](https://github.com/mymanao/manao-wiki)

---

## 📍 Features

### Chat Commands

Below is an overview of the core chatbot modules. For extended command flags and usage syntax, refer to the [ManaoWiki](https://manaobot.netlify.app/).

| Category | Command | Description |
| :--- | :--- | :--- |
| **Moderation** | `Announce` | Broadcast an announcement to chat. |
| | `Game` | Update the stream's current category/game. |
| | `Shoutout` | Trigger a native Twitch shoutout. |
| | `Stream` | Update the stream title. |
| | `Event` | Connect to external webhooks/events. |
| **Economy** | `Balance` | Check user wallet balance. |
| | `Gamble` | Wager currency. |
| | `Give` | Transfer currency to another user. |
| | `Autobet` | Execute multiple automated wagers. |
| | `Leaderboard`| Display top balances. |
| | `Set` | (Admin) Modify a user's balance. |
| **Social** | `Eat` | RNG food selection. |
| | `Hate` / `Love`| RNG affinity calculators. |
| | `Stomp` | Chat interaction command. |
| **Info** | `Help` | Output the standard help dialog. |
| | `Uptime` | Display current stream duration. |
| | `Version` | Output current bot build/version. |
| | `Link` | Bind a Twitch account to a Discord user. |
| **Preferences**| `Nickname` | Set local alias (syncs with Chat Overlay). |
| | `Currency` | Define the global currency string/emoji. |
| | `Language` | Toggle standard bot response language. |
| **Music** | `Song-*` | Standard queue management (`sq`, `sd`, `rm`, `sk`, `sr`, `np`). |

### Overlays

Manao exposes local web endpoints meant to be ingested as Browser Sources in OBS, Streamlabs, or other broadcast software.

Assuming default local hosting settings, add these URLs to your broadcast software:

* **Chat Overlay:** `http://localhost:3000/overlays/chat` *(Integrates with the `Nickname` command)*
* **Event Feed:** `http://localhost:3000/overlays/feed` *(Integrates with Economy commands)*
* **Music Player:** `http://localhost:3000/overlays/music`
* **Soundboard:** `http://localhost:3000/soundboard/player`

### Entertainment & Audio

*(Requires ManaoBot v2.2.0+)*

* **Soundboard & Channel Points:** You can map Twitch Channel Point redemptions directly to local audio files. Manage your mappings via the [Local Rewards Manager](http://localhost:3000/manager/channel-points). To trigger audio manually, use the [Soundboard Controller](http://localhost:3000/soundboard/controller).
* **Custom Chat Replies:** The bot can parse chat for specific RegEx/keywords and output pre-defined responses. Configure these triggers at the [Local Replies Manager](http://localhost:3000/manager/replies).

---

## 👋 Contributing & Community

We welcome contributions from the community! Whether it's adding a new feature, fixing a bug, or expanding our multilingual support, please review our [CONTRIBUTING.md](/.github/CONTRIBUTING.md) guidelines before opening a Pull Request.

If you have questions about the codebase or want to discuss a feature request, feel free to drop into our [Discord server](https://discord.gg/vkW7YMyYaf).

---

## 📜 License

This repository is licensed under the [GNU General Public License v3.0](/LICENSE). For full legal details, refer to the [GNU Official Website](https://www.gnu.org/licenses/gpl-3.0.en.html).

---

## 🙋‍♂️ FAQ & Troubleshooting

### How do I configure my Twitch API credentials?

You must generate OAuth tokens for Manao to interface with Twitch.

1. Create a **New Application** (not an extension) in the [Twitch Developer Portal](https://dev.twitch.tv/).
2. Set the "OAuth Redirect URL" to `http://localhost:3000/`.
3. Set Category to "Chat Bot" and Client Type to "Confidential".
4. Copy your `Client ID` and `Client Secret` into your `.env` file.
5. Install the [TwitchCLI](https://dev.twitch.tv/docs/cli/).
6. Run the following command to generate your access token with the necessary scopes:

```bash
twitch token -u -s "user:edit user:read:email chat:read chat:edit channel:moderate moderation:read moderator:manage:shoutouts moderator:manage:announcements channel:manage:moderators channel:manage:broadcast channel:read:vips channel:read:subscriptions channel:manage:vips channel:read:redemptions channel:manage:redemptions moderator:read:followers bits:read"
```

> **Security Note:** You must run this command *twice*—once while logged into your bot account, and once while logged into your broadcaster account. **Ensure you log out of Twitch in your browser between runs.** Append the resulting User Access Tokens and Refresh Tokens to your `.env` file accordingly.

### Is Bun supported on Windows?

Yes. While historically limited to Unix environments, **Bun is now natively supported on Windows.** You can follow the [Official Bun Windows Installation Guide](https://bun.sh/docs/installation/windows). If you run into environment-specific issues, check the [Bun Discord](https://bun.sh/discord).

### How do I interact with the Music Player in OBS?

Add `http://localhost:3000/overlays/music` as a Browser Source. To skip songs manually or adjust the YouTube Player volume:
1. Right-click the Browser Source in OBS and select **Interact**.
2. Use the pop-up window to scrub the timeline, pause, or adjust volume. *(Note: Pausing the video here will not break the bot's internal queue logic).*

### How do I change the bot's command prefix?

The default prefix is defined in the source configuration. Open `src/config.ts` in your editor, locate the `PREFIX` constant, and modify the string to your preferred character(s).

### How do I report a security vulnerability or get direct help?

For general troubleshooting, feel free to ask in the [Discord server](https://discord.gg/vkW7YMyYaf) or open an issue on the GitHub tracker.

If you have discovered a security vulnerability, please do not open a public issue. Instead, join the Discord server and DM `@acsp` (Tin) directly.