<p align="center">
  <a href="https://github.com/wrong-lang/manao">
    <img src="https://raw.githubusercontent.com/tinarskii/manao/main/docs/manao.svg" height="64px" width="auto" />
    <h2 align="center">
      Manao
    </h2>
  </a>
  <p align="center">
    A collection of utilities and tools for Twitch streamers
  </p>
  <div style="display: flex; flex-wrap: wrap; justify-items: center; justify-content: center">
<a href="https://wakatime.com/badge/user/5cb7cd14-ac7e-4fc0-9f81-6036760cb6a3/project/018dddd9-a419-43b0-95cd-8348fafaccad"><img src="https://wakatime.com/badge/user/5cb7cd14-ac7e-4fc0-9f81-6036760cb6a3/project/018dddd9-a419-43b0-95cd-8348fafaccad.svg" alt="wakatime"></a>
<a href="https://github.com/wrong-lang/manao/pulse"><img src="https://img.shields.io/github/commit-activity/m/badges/shields" /></a>
    <img src="https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png" />   
    <img src="https://img.shields.io/github/languages/top/wrong-lang/manao" />
    <a href="https://discord.gg/vkW7YMyYaf"><img src="https://img.shields.io/discord/964718161624715304" /></a>
    <a href="/.github/CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg" /></a>
    <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=plastic" />
  </div>
</p>

## Table of Contents

- [About](#-about)
- [Features](#-features)
- [Installation](#-installation)
- [Contributing](#-contributing)
- [License](#-license)
- [FAQ](#-faq)

## 🤔 About

This project includes a Twitch chatbot and some overlays used in my Twitch channel (tinarskii). Inspired
by [thananon/twitch_tools](https://github.com/thananon/twitch_tools)
and [lucidkarn/luciabot](https://github.com/lucidkarn/luciabot).
The project is written in TypeScript and uses Bun instead of Node.js, many features may be unavailable or not working as
expected if you are not using Bun.

## 📍 Features

### Chat bot

For a more comprehensive list, check the [wiki](https://github.com/wrong-lang/manao/wiki).

- Moderation
    1. `Announce` - Announce a message to the chat
    2. `Game    ` - Change stream's game
    3. `Shoutout` - Shoutout a user
    4. `Stream  ` - Change stream's title


- Economy
    1. `Balance     ` - Check your balance
    2. `Gamble      ` - Gamble your money
    3. `Give        ` - Give money to another user
    4. `Autobet     ` - Automatically gamble multiple times 
    5. `Leaderboard ` - Automatically gamble multiple times 
    6. `Set         ` - Set user's balance


- Social
    1. `Eat     ` - Chose a random food to eat
    2. `Hate    ` - How much do you hate someone?
    3. `Love    ` - How much do you love someone?
    4. `Stomp   ` - Stomp on someone

- Info
    1. `Help    ` - Show help message
    2. `Uptime  ` - Show stream uptime
    3. `Version ` - Show bot version

- Preferences
    1. `Nickname` - Change your nickname (Linked with the chat overlay)
    2. `Currency` - Change global currency
    3. `Language` - Change bot language


- Music
    1. `Song-Queue   (sq)` - Show the music queue
    2. `Song-Default (sd)` - Set default songs when the queue is empty
    3. `Song-Remove  (rm)` - Remove a song from the queue
    4. `Song-Skip    (sk)` - Skip the current song
    5. `Song-Request (sr)` - Add a song to the queue
    6. `Song-Playing (np)` - Show the current song

### Overlay

- `Chat Overlay` - Show chat messages on the stream (Nickname command linked)
- `Event Feed  ` - Show recent events on the stream (Linked with economic commands)
- `Music Player` - Play music on the stream (Click now-playing box to hide the video)

### Entertainment 
You can now add a new channel point rewards to play sounds on stream using the rewards manager.
Add yours now!
(Version 2.1.0 or higher): http://localhost:3000/soundboard/channel-points. 
But if you want to control the soundboard yourself, go to the soundboard controller:
http://localhost:3000/soundboard/controller.
Otherwise, you can use the soundboard player overlay: 
http://localhost:3000/soundboard/player.
(Click "Hide" button to hide the entire page and become audio player only)

## 🛠️ Installation

### Prerequisites

- [Bun](https://bun.sh) (Version 1.0.0 or higher is recommended)
- [Twitch Developer Account](https://dev.twitch.tv/) (For the chatbot)

### Setup

1. Clone the repository

```sh
git clone https://github.com/wrong-lang/manao.git
cd manao
```

2. Install dependencies

```sh
bun install
```

3. Rename a `.env.example` file to `.env` in the root directory, the file content should be something like this:

```dotenv
# ========================
#       TWITCH BOT
# ========================

USE_TWITCH=true # Set to false if you don't want to use the Twitch bot 
TWITCH_BOT_ACCESS_TOKEN= # Run setup script
TWITCH_BOT_REFRESH_TOKEN= # Run setup script

BROADCASTER_ACCESS_TOKEN= # Run setup script
BROADCASTER_REFRESH_TOKEN= # Run setup script

TWITCH_BOT_ID= # Run setup script
BROADCASTER_ID= # Run setup script
BROADCASTER_CHANNEL= # Run setup script

TWITCH_CLIENT_ID= # Get it from Twitch Developer Portal (Read wiki)
TWITCH_CLIENT_SECRET= # Get it from Twitch Developer Portal (Read wiki)

# ========================
#       DISCORD BOT
# ========================

USE_DISCORD=false
DISCORD_BOT_TOKEN= # Not yet implemented
DISCORD_CLIENT_ID= # Not yet implemented
SERVER_ID= # Not yet implemented

NODE_ENV= # Either "development" or "production" but for now it doesn't make any differences
```

4. Start the bot

```sh
bun start
```

## 👋 Contributing

If you want to contribute to the project, please read the [CONTRIBUTING.md](/.github/CONTRIBUTING.md) file.
However, if you have any questions, feel free to ask in the [Discord server](https://discord.gg/vkW7YMyYaf).

## 📜 License

This project is licensed under the [MIT License](/LICENSE).

## 🙋‍♂️ FAQ

### How do I get my Twitch API credentials?

You can get your Twitch API credentials by creating a **new application** (not extensions) in
the [Twitch Developer Portal](https://dev.twitch.tv/). Set "OAuth Redirect URL" to `http://localhost:3000/`, set the category
to "Chat Bot" and client type to "Confidential". After that, you will be redirected to the application page.
Get your client ID and client secret from the application's dashboard, and add them to your `.env` file.
After that, you can install [TwitchCLI](https://dev.twitch.tv/docs/cli/) and run the following command to get your
access token:

```sh
twitch token -u -s "user:edit user:read:email chat:read chat:edit channel:moderate moderation:read moderator:manage:shoutouts moderator:manage:announcements channel:manage:moderators channel:manage:broadcast channel:read:vips channel:read:subscriptions channel:manage:vips channel:read:redemptions channel:manage:redemptions moderator:read:followers bits:read"
```

You will receive a user access token and a refresh token, add them to your `.env` file.
**Note:** You should run the following command 2 times, once for the bot account and once for the broadcaster account, make sure
to logout of Twitch before running the command again. Put the access token and refresh token in the `.env` file accordingly.

### I couldn't install Bun in my system

_~~Currently, Bun is only available for Linux and MacOS. If you are using Windows, you can use WSL or a virtual machine to
run the project.~~_
**Bun is now available for Windows**, you can follow the [official documentation](https://bun.sh/docs/installation/windows)
for the installation.
For further assistance about installing Bun, you may ask in the [Bun official Discord server](https://bun.sh/discord).

### How do I add the overlays to my stream?

You can add the overlays to your stream by adding a new browser source in your streaming software (OBS, Streamlabs, etc.).
You can copy the URL of the overlay you want to add and paste it in the URL field of the browser source.
For music source, to interact with the player, find the "Interact" button. From there, you can set the YouTube Player 
volume and interact with the music player. You can also pause the video, it won't interrupt with the music player functions.
If you want to skip the song manually, drag the time slider to the end of the video.

The URLs of the overlays are as follows (assuming you are running the bot locally):
- Chat Overlay: `http://localhost:3000/overlays/chat`
- Event Feed: `http://localhost:3000/overlays/events`
- Music Player: `http://localhost:3000/overlays/music`
- Soundboard Player: `http://localhost:3000/soundboard/player`

### How do I change the bot's prefix?

You can change the bot's prefix by modifying the `PREFIX` variable in the `src/config.ts` file.

### Will there be another language support?

No, not at the moment. However, if you want to help with translations, feel free to open a pull request.

### I have a question that is not listed here / A problem with the bot

Feel free to ask in the [Discord server](https://discord.gg/vkW7YMyYaf) or open an issue on GitHub.
If it's a security issue, join the Discord server and send me friend request to DM me directly (@acsp - Tin).
