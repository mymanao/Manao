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

INSTALL_DIR="$HOME/ManaoBot"
DESKTOP_DIR="$HOME/Desktop"

# ── Check installation exists ─────────────────────────────────────────────────

if [ ! -d "$INSTALL_DIR" ]; then
    zenity --error --text="ManaoBot installation not found at $INSTALL_DIR. Nothing to uninstall."
    exit 1
fi

if ! zenity --question --text="This will remove ManaoBot from $INSTALL_DIR. Do you want to continue?"; then
    zenity --info --text="Uninstall cancelled."
    exit 0
fi

# ── Backup config files ───────────────────────────────────────────────────────

if zenity --question --text="Do you want to save your config and data files before uninstalling?"; then
    SAVE_TO="$HOME/ManaoBot-backup"
    mkdir -p "$SAVE_TO"
    for f in .env bot-data.sqlite userConfig.json; do
        if [ -f "$INSTALL_DIR/$f" ]; then
            cp "$INSTALL_DIR/$f" "$SAVE_TO/"
            echo "  Saved $f → $SAVE_TO"
        fi
    done
    zenity --info --text="Config files saved to $SAVE_TO"
fi

# ── Double confirm ────────────────────────────────────────────────────────────

if ! zenity --question --title="Are you sure?" --text="Permanently delete ManaoBot? This cannot be undone."; then
    zenity --info --text="Uninstall cancelled."
    exit 0
fi

# ── Remove install directory ──────────────────────────────────────────────────

echo "Removing ManaoBot..."
if ! rm -rf "$INSTALL_DIR"; then
    zenity --error --text="Failed to remove $INSTALL_DIR. Try running with sudo."
    exit 1
fi
echo "  Removed $INSTALL_DIR"

# ── Remove shortcuts ──────────────────────────────────────────────────────────

APP_DIR="$HOME/.local/share/applications"
for name in "ManaoBot" "ManaoBot Setup" "ManaoBot Manager"; do
    rm -f "$DESKTOP_DIR/$name.desktop"
    rm -f "$APP_DIR/$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-').desktop"
    echo "  Removed shortcut: $name"
done

# ── Done ──────────────────────────────────────────────────────────────────────

zenity --info --text="ManaoBot has been successfully uninstalled."