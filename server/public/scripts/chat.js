const socket = createSocketConnection();

function loadSettingsCSS() {
  try {
    const settings = localStorage.getItem("chatOverlaySettings");
    if (!settings) return "";

    const s = JSON.parse(settings);
    const opacityHex = Math.round(s.backgroundOpacity * 255)
      .toString(16)
      .padStart(2, "0");

    const roleStyles = Object.entries(s.roleBackgrounds || {})
      .map(([role, [start, end]]) => {
        const startColor = start?.trim() || "4e4e48";
        const endColor = end?.trim() || "38342b";
        return `
          .chatbox-container[data-role="${role}"] {
            background: linear-gradient(135deg, #${startColor}${opacityHex}, #${endColor}${opacityHex}) !important;
            border-${s.align === "right" ? "right" : s.align === "center" ? "bottom" : "left"}-color: #${endColor} !important;
          }
        `;
      })
      .join("\n");

    const alignmentStyles = {
      left: `
        .chatbox-container.align-left {
          border-right: none !important;
          border-bottom: none !important;
          border-left: ${s.borderWidth || 10}px solid !important;
          text-align: left !important;
        }
      `,
      center: `
        .chatbox-container.align-center {
          border-left: none !important;
          border-right: none !important;
          border-bottom: ${s.borderWidth || 10}px solid !important;
          text-align: center !important;
        }
      `,
      right: `
        .chatbox-container.align-right {
          border-left: none !important;
          border-bottom: none !important;
          border-right: ${s.borderWidth || 10}px solid !important;
          text-align: right !important;
        }
      `,
    };

    const css = `
      :root {
        --chat-text-color: ${s.textColor || "#ffffff"};
        --chat-font-size: ${s.fontSize || 20}px;
        --chat-font-weight: ${s.fontWeight || "400"};
        --chat-letter-spacing: ${s.letterSpacing || 0}px;
        --chat-border-radius: ${s.borderRadius || 16}px;
        --chat-padding: ${s.padding || 12}px;
        --chat-box-shadow: ${
          s.boxShadow !== false ? "0 2px 8px rgba(0, 0, 0, 0.25)" : "none"
        };
        --chat-text-shadow: ${
          s.textShadow !== false ? "0 2px 8px rgba(0, 0, 0, 0.7)" : "none"
        };
      }

      .chatbox-container {
        border-radius: var(--chat-border-radius) !important;
        padding: var(--chat-padding) !important;
        box-shadow: var(--chat-box-shadow) !important;
      }

      .chatbox-container .message {
        color: var(--chat-text-color) !important;
        font-size: var(--chat-font-size) !important;
        font-weight: var(--chat-font-weight) !important;
        letter-spacing: var(--chat-letter-spacing) !important;
        text-shadow: var(--chat-text-shadow) !important;
      }

      .chatbox-container .username {
        text-shadow: ${
          s.textShadow !== false ? "0 2px 8px rgba(0, 0, 0, 0.7)" : "none"
        } !important;
        font-weight: ${Math.min(parseInt(s.fontWeight || "400") + 100, 900)} !important;
      }

      ${alignmentStyles[s.align] || alignmentStyles.left}

      ${roleStyles}

      ${s.hideBadges ? ".badges { display: none !important; }" : ""}

      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideInUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideInDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOutLeft {
        to {
          transform: translateX(-100%);
          opacity: 0;
        }
      }

      @keyframes slideOutRight {
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes slideOutUp {
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }

      @keyframes slideOutDown {
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        to {
          opacity: 0;
        }
      }

      @keyframes fadeInUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes fadeOutUp {
        to {
          transform: translateY(-20px);
          opacity: 0;
        }
      }

      @keyframes fadeInDown {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes fadeOutDown {
        to {
          transform: translateY(20px);
          opacity: 0;
        }
      }

      @keyframes bounceInRight {
        0% {
          transform: translateX(100%);
          opacity: 0;
        }
        60% {
          transform: translateX(-10px);
          opacity: 1;
        }
        100% {
          transform: translateX(0);
        }
      }

      @keyframes bounceInLeft {
        0% {
          transform: translateX(-100%);
          opacity: 0;
        }
        60% {
          transform: translateX(10px);
          opacity: 1;
        }
        100% {
          transform: translateX(0);
        }
      }

      @keyframes bounceOutRight {
        0% {
          transform: translateX(0);
        }
        60% {
          transform: translateX(10px);
        }
        100% {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes bounceOutLeft {
        0% {
          transform: translateX(0);
        }
        60% {
          transform: translateX(-10px);
        }
        100% {
          transform: translateX(-100%);
          opacity: 0;
        }
      }
    `;

    return css;
  } catch (error) {
    console.error("Error generating settings CSS:", error);
    return "";
  }
}

function applyAllCSS() {
  try {
    document.querySelector('style[data-chat-overlay="true"]')?.remove();

    const settingsCSS = loadSettingsCSS();

    const customCSS = localStorage.getItem("chatCustomCSS") || "";

    const style = document.createElement("style");
    style.setAttribute("data-chat-overlay", "true");
    style.textContent = settingsCSS + "\n\n" + customCSS;
    document.head.appendChild(style);
  } catch (error) {
    console.error("Error applying CSS:", error);
  }
}

applyAllCSS();

document.getElementById("template-container").innerHTML = `
<script id="chatlist_item" type="text/template">
  <div data-from="{from}" data-id="{messageId}">
    <div class="chatbox-container {role} align-{align}" id="{messageId}-container">
      <div class="meta" style="color: {color}">
        <span class="badges"></span>
        <span class="username" id="{messageId}-author">{from}</span>
      </div>
      <div class="message" id="{messageId}-msg">{message}</div>
    </div>
  </div>
</script>
`;

const log = document.getElementById("log");
let messageCount = 0;
const timeout = getParam("timeout") ?? 0;

function getAnimationClass(direction) {
  try {
    const settings = JSON.parse(
      localStorage.getItem("chatOverlaySettings") || "{}",
    );
    return settings.animationIn || "slideInRight";
  } catch {
    return "slideInRight";
  }
}

socket.on("message", (data) => {
  const chatWrapper = document.createElement("div");
  const alignment = (() => {
    try {
      const settings = JSON.parse(
        localStorage.getItem("chatOverlaySettings") || "{}",
      );
      return settings.align || "left";
    } catch {
      return "left";
    }
  })();

  chatWrapper.innerHTML = document
    .getElementById("chatlist_item")
    .innerHTML.replace(/{from}/g, data.from)
    .replace(/{messageId}/g, data.id)
    .replace(/{message}/g, data.message)
    .replace(/{role}/g, data.role)
    .replace(/{color}/g, data.color)
    .replace(/{align}/g, alignment);

  const chatEl = chatWrapper.firstElementChild;
  const container = chatEl.querySelector(".chatbox-container");

  container.classList.add(getAnimationClass());

  if (data.badges?.length) {
    const badges = chatEl.querySelector(".badges");
    data.badges.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.className = "inline-block w-4 h-4 mr-1";
      img.alt = `${data.role} badge`;
      badges.appendChild(img);
    });
  }

  log.appendChild(chatEl);
  messageCount++;

  const limit = getParam("limit") ?? 0;
  if (limit > 0 && messageCount > limit) {
    const excess = messageCount - limit;
    for (let i = 0; i < excess && log.children.length; i++) {
      log.firstElementChild?.remove();
      messageCount--;
    }
  }

  if (timeout > 0) {
    setTimeout(() => {
      const containerToAnimate = chatEl.querySelector(".chatbox-container");
      if (containerToAnimate) {
        try {
          const settings = JSON.parse(
            localStorage.getItem("chatOverlaySettings") || "{}",
          );
          const animationOut = settings.animationOut || "slideOutLeft";
          containerToAnimate.classList.add(animationOut);
        } catch {
          containerToAnimate.classList.add("slideOutLeft");
        }
      }
      setTimeout(() => {
        chatEl.remove();
        messageCount--;
      }, 750);
    }, timeout);
  }
});

window.addEventListener("storage", (e) => {
  if (e.key === "chatOverlaySettings" || e.key === "chatCustomCSS") {
    applyAllCSS();
  }
});
