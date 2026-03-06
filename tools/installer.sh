#!/usr/bin/env bash

echo "
::::    ::::      :::     ::::    :::     :::      ::::::::       :::     :::    :::
+:+:+: :+:+:+   :+: :+:   :+:+:   :+:   :+: :+:   :+:    :+:      :+:     :+:   :+:
+:+ +:+:+ +:+  +:+   +:+  :+:+:+  +:+  +:+   +:+  +:+    +:+      +:+     +:+  +:+ +:+
+#+  +:+  +#+ +#++:++#++: +#+ +:+ +#+ +#++:++#++: +#+    +:+      +#+     +:+ +#+  +:+
+#+       +#+ +#+     +#+ +#+  +#+#+# +#+     +#+ +#+    +#+       +#+   +#+ +#+#+#+#+#+
#+#       #+# #+#     #+# #+#   #+#+# #+#     #+# #+#    #+#        #+#+#+#        #+#
###       ### ###     ### ###    #### ###     ###  ########           ###          ###
"

# ── Mode selection ────────────────────────────────────────────────────────────

INSTALL_DIR="$HOME/ManaoBot"

MODE=$(zenity --list \
    --title="ManaoBot Manager" \
    --column="Action" \
    --width=300 --height=250 \
    "Install / Update" \
    "Run Setup" \
    "Uninstall")

if [ -z "$MODE" ]; then exit 0; fi

# ── Uninstall flow ────────────────────────────────────────────────────────────

if [ "$MODE" = "Uninstall" ]; then
    if [ ! -d "$INSTALL_DIR" ]; then
        zenity --error --text="ManaoBot installation not found at $INSTALL_DIR. Nothing to uninstall."
        exit 1
    fi
    if ! zenity --question --text="This will remove ManaoBot from $INSTALL_DIR. Do you want to continue?"; then
        zenity --info --text="Uninstall cancelled."
        exit 0
    fi

    if zenity --question --text="Do you want to save your config and data files before uninstalling?"; then
        SAVE_TO="$HOME/ManaoBot-backup"
        mkdir -p "$SAVE_TO"
        for f in .env bot-data.sqlite userConfig.json; do
            [ -f "$INSTALL_DIR/$f" ] && cp "$INSTALL_DIR/$f" "$SAVE_TO/" && echo "  Saved $f"
        done
        zenity --info --text="Config files saved to $SAVE_TO"
    fi

    if ! zenity --question --title="Are you sure?" --text="Permanently delete ManaoBot? This cannot be undone."; then
        zenity --info --text="Uninstall cancelled."
        exit 0
    fi

    rm -rf "$INSTALL_DIR"

    DESKTOP_DIR="$HOME/Desktop"
    APP_DIR="$HOME/.local/share/applications"
    for name in "ManaoBot" "ManaoBot Setup" "ManaoBot Manager"; do
        rm -f "$DESKTOP_DIR/$name.desktop"
        rm -f "$APP_DIR/$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-').desktop"
    done

    zenity --info --text="ManaoBot has been successfully uninstalled."
    exit 0
fi

# ── Setup flow ────────────────────────────────────────────────────────────────

if [ "$MODE" = "Run Setup" ]; then
    if [ ! -d "$INSTALL_DIR" ]; then
        zenity --error --text="ManaoBot installation not found at $INSTALL_DIR. Please install first."
        exit 1
    fi
    cd "$INSTALL_DIR" && bun run setup
    exit 0
fi

# ── Dependency: jq ───────────────────────────────────────────────────────────

if ! command -v jq &> /dev/null; then
    if zenity --question --text="jq is not installed. Do you want to install it now?"; then
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if command -v apt &> /dev/null; then
                sudo apt update && sudo apt install -y jq
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y jq
            elif command -v pacman &> /dev/null; then
                sudo pacman -S --noconfirm jq
            else
                zenity --error --text="Unsupported package manager. Please install jq manually and run this installer again."
                exit 1
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            if command -v brew &> /dev/null; then
                brew install jq
            else
                zenity --error --text="Homebrew is not installed. Please install Homebrew and run this installer again."
                exit 1
            fi
        else
            zenity --error --text="Unsupported operating system. Please install jq manually and run this installer again."
            exit 1
        fi
    else
        zenity --error --text="jq is required to run this installer. Exiting."
        exit 1
    fi
fi

# ── Dependency: git ───────────────────────────────────────────────────────────

if ! command -v git &> /dev/null; then
    if zenity --question --text="Git is not installed. Do you want to install it now?"; then
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if command -v apt &> /dev/null; then
                sudo apt update && sudo apt install -y git
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y git
            elif command -v pacman &> /dev/null; then
                sudo pacman -S --noconfirm git
            else
                zenity --error --text="Unsupported package manager. Please install git manually and run this installer again."
                exit 1
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            if command -v brew &> /dev/null; then
                brew install git
            else
                zenity --error --text="Homebrew is not installed. Please install Homebrew and run this installer again."
                exit 1
            fi
        else
            zenity --error --text="Unsupported operating system. Please install git manually and run this installer again."
            exit 1
        fi
    else
        zenity --error --text="Git is required to install ManaoBot. Exiting."
        exit 1
    fi
fi

# ── Dependency: bun ───────────────────────────────────────────────────────────

if ! command -v bun &> /dev/null; then
    if zenity --question --text="Bun is not installed. Do you want to install it now?"; then
        curl -fsSL https://bun.sh/install | bash
        export PATH="$HOME/.bun/bin:$PATH"
    else
        zenity --error --text="Bun is required to run ManaoBot. Exiting."
        exit 1
    fi
fi

# ── Dependency: twitch-cli ────────────────────────────────────────────────────

if ! command -v twitch &> /dev/null; then
    if zenity --question --text="twitch-cli is not installed. Do you want to install it now?"; then
        if command -v brew &> /dev/null; then
            brew install twitch-cli
        else
            zenity --error --text="Homebrew is not installed. Please install Homebrew and run this installer again."
            exit 1
        fi
    else
        zenity --error --text="twitch-cli is required to run ManaoBot. Exiting."
        exit 1
    fi
fi

# ── Version selection ─────────────────────────────────────────────────────────

VERSIONS=$(curl -sL https://api.github.com/repos/mymanao/manao/tags | jq -r '.[].name' | grep -E '^4\.[0-9]+\.[0-9]+$' | sort -V -r)

if [ -z "$VERSIONS" ]; then
    zenity --error --text="Failed to fetch versions from GitHub. Check your internet connection and try again."
    exit 1
fi

SELECTED_VERSION=$(echo "$VERSIONS" | zenity --list --title="Select Manao Version" --column="Version" --width=300 --height=400)
if [ -z "$SELECTED_VERSION" ]; then
    zenity --error --text="No version selected. Exiting."
    exit 1
fi

# ── Backup ────────────────────────────────────────────────────────────────────

INSTALL_DIR="$HOME/ManaoBot"
BACKUP_DIR=$(mktemp -d)

if [ -d "$INSTALL_DIR" ]; then
    if ! zenity --question --text="$INSTALL_DIR already exists. Do you want to overwrite it?"; then
        zenity --info --text="Installation cancelled."
        exit 0
    fi

    # Back up to temp dir before wiping install dir
    [ -f "$INSTALL_DIR/.env" ]             && cp "$INSTALL_DIR/.env"             "$BACKUP_DIR/"
    [ -f "$INSTALL_DIR/bot-data.sqlite" ]  && cp "$INSTALL_DIR/bot-data.sqlite"  "$BACKUP_DIR/"
    [ -f "$INSTALL_DIR/userConfig.json" ]  && cp "$INSTALL_DIR/userConfig.json"  "$BACKUP_DIR/"

    rm -rf "$INSTALL_DIR"
fi

# ── Clone ─────────────────────────────────────────────────────────────────────

if ! git clone --branch "$SELECTED_VERSION" --depth 1 https://github.com/mymanao/manao.git "$INSTALL_DIR"; then
    zenity --error --text="Failed to clone ManaoBot $SELECTED_VERSION. Check your internet connection and try again."
    rm -rf "$BACKUP_DIR"
    exit 1
fi

# ── Install dependencies ──────────────────────────────────────────────────────

cd "$INSTALL_DIR" || exit 1
if ! bun install; then
    zenity --error --text="Failed to install dependencies. Check your internet connection and try again."
    rm -rf "$BACKUP_DIR"
    exit 1
fi

# ── Restore backup ────────────────────────────────────────────────────────────

[ -f "$BACKUP_DIR/.env" ]             && mv "$BACKUP_DIR/.env"             "$INSTALL_DIR/"
[ -f "$BACKUP_DIR/bot-data.sqlite" ]  && mv "$BACKUP_DIR/bot-data.sqlite"  "$INSTALL_DIR/"
[ -f "$BACKUP_DIR/userConfig.json" ]  && mv "$BACKUP_DIR/userConfig.json"  "$INSTALL_DIR/"
rm -rf "$BACKUP_DIR"

# ── Desktop shortcuts ─────────────────────────────────────────────────────────

DESKTOP_DIR="$HOME/Desktop"
SHORTCUT_PATH="$DESKTOP_DIR/ManaoBot.desktop"
SHORTCUT_PATH_SETUP="$DESKTOP_DIR/ManaoBot Setup.desktop"

rm -f "$SHORTCUT_PATH" "$SHORTCUT_PATH_SETUP"

cat > "$SHORTCUT_PATH" <<EOL
[Desktop Entry]
Type=Application
Name=ManaoBot
Exec=$INSTALL_DIR/tools/start_manao.sh
Icon=$INSTALL_DIR/docs/manao_mini.png
Terminal=true
EOL

cat > "$SHORTCUT_PATH_SETUP" <<EOL
[Desktop Entry]
Type=Application
Name=ManaoBot Setup
Exec=$INSTALL_DIR/tools/start_setup.sh
Icon=$INSTALL_DIR/docs/manao_mini.png
Terminal=true
EOL

chmod +x "$SHORTCUT_PATH" "$SHORTCUT_PATH_SETUP"

# ── Done ──────────────────────────────────────────────────────────────────────

zenity --info --text="ManaoBot $SELECTED_VERSION has been installed successfully! A shortcut has been created on your desktop."

if zenity --question --text="Do you want to run the setup now?"; then
    "$INSTALL_DIR/tools/start_setup.sh"
else
    zenity --info --text="You can run the setup later by double-clicking the ManaoBot Setup shortcut on your desktop."
fi