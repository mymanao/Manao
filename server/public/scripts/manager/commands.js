const addCustomBtn = document.getElementById("add-custom-btn");
const customCommandModal = document.getElementById("customCommandModal");
const customCommandForm = document.getElementById("customCommandForm");

async function fetchCommands() {
  const res = await fetch("/api/commands");
  const commands = await res.json();
  const tbody = document.getElementById("commands-table");
  tbody.innerHTML = "";

  commands.forEach((cmd) => {
    const tr = document.createElement("tr");

    const enabledTd = document.createElement("td");
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = !cmd.disabled;
    toggle.className = "toggle toggle-primary";
    toggle.addEventListener("change", () => {
      fetch(`/api/commands/${encodeURIComponent(cmd.name)}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: !toggle.checked }),
      });
    });
    enabledTd.appendChild(toggle);
    tr.appendChild(enabledTd);

    const nameTd = document.createElement("td");
    nameTd.textContent = cmd.name;
    tr.appendChild(nameTd);

    const descTd = document.createElement("td");
    descTd.textContent = cmd.description;
    tr.appendChild(descTd);

    const aliasTd = document.createElement("td");
    aliasTd.textContent = (cmd.alias || []).join(", ");
    tr.appendChild(aliasTd);

    const argsTd = document.createElement("td");
    argsTd.innerHTML =
      (cmd.args || [])
        .map((a) => `${a.name}${a.required ? "" : "?"} — ${a.description}`)
        .join("<br>") || "—";
    tr.appendChild(argsTd);

    tbody.appendChild(tr);
  });
}

async function fetchCustomCommands() {
  try {
    const [commandsRes, langRes] = await Promise.all([
      fetch("/api/custom-commands"),
      fetch("/api/lang"),
    ]);
    const customCommands = await commandsRes.json();
    const { lang: currentLang } = await langRes.json();
    const tbody = document.getElementById("custom-commands-table");
    tbody.innerHTML = "";

    customCommands.forEach((cmd) => {
      const tr = document.createElement("tr");

      const nameTd = document.createElement("td");
      nameTd.textContent = cmd.name[currentLang];
      tr.appendChild(nameTd);

      const descTd = document.createElement("td");
      descTd.textContent = cmd.description[currentLang];
      tr.appendChild(descTd);

      const aliasTd = document.createElement("td");
      aliasTd.textContent = (cmd.aliases[currentLang] || []).join(", ");
      tr.appendChild(aliasTd);

      const argsTd = document.createElement("td");
      argsTd.textContent =
        (cmd.args || [])
          .map((a) => `${a.name}${a.required ? "" : "?"}`)
          .join(", ") || "—";
      tr.appendChild(argsTd);

      const actionsTd = document.createElement("td");
      actionsTd.classList.add("flex", "gap-2");

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-info";
      editBtn.innerHTML = `<i class="fas fa-edit"></i> Edit`;
      editBtn.onclick = () => openEditModal(cmd);
      actionsTd.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-error";
      deleteBtn.innerHTML = `<i class="fas fa-trash"></i> Delete`;
      deleteBtn.onclick = () => handleDeleteCommand(cmd.name.en);
      actionsTd.appendChild(deleteBtn);

      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to fetch custom commands:", err);
  }
}

async function handleDeleteCommand(id) {
  if (!confirm("Are you sure you want to delete this command?")) return;
  try {
    const res = await fetch(`/api/custom-commands/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    await fetchCustomCommands();
  } catch (err) {
    console.error("Failed to delete command:", err);
  }
}

addCustomBtn.addEventListener("click", () => openEditModal());

function openEditModal(cmd = null) {
  customCommandForm.reset();
  customCommandForm.dataset.id = cmd ? cmd.name.en : "";
  if (cmd) {
    customCommandForm["name_en"].value = cmd.name.en;
    customCommandForm["name_th"].value = cmd.name.th || "";
    customCommandForm["description_en"].value = cmd.description.en;
    customCommandForm["description_th"].value = cmd.description.th || "";
    customCommandForm["aliases_en"].value = (cmd.aliases?.en || []).join(", ");
    customCommandForm["aliases_th"].value = (cmd.aliases?.th || []).join(", ");
    customCommandForm["execute"].value = cmd.execute;
    customCommandForm["modsOnly"].checked = !!cmd.modsOnly;
    customCommandForm["broadcasterOnly"].checked = !!cmd.broadcasterOnly;
  }
  customCommandModal.showModal();
}

customCommandForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const id = form.dataset.id;

  const payload = {
    name: {
      en: form["name_en"].value.trim(),
      th: form["name_th"].value.trim(),
    },
    description: {
      en: form["description_en"].value.trim(),
      th: form["description_th"].value.trim(),
    },
    aliases: {
      en: form["aliases_en"].value
        ? form["aliases_en"].value.split(",").map((a) => a.trim())
        : [],
      th: form["aliases_th"].value
        ? form["aliases_th"].value.split(",").map((a) => a.trim())
        : [],
    },
    args: [],
    execute: form["execute"].value.trim(),
    modsOnly: form["modsOnly"].checked,
    broadcasterOnly: form["broadcasterOnly"].checked,
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/custom-commands/${id}` : "/api/custom-commands";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    customCommandModal.close();
    await fetchCustomCommands();
  } catch (err) {
    console.error("Failed to save command:", err);
  }
});

fetchCommands();
fetchCustomCommands();
