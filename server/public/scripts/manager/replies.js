let customReplies = [];

function renderReplies() {
  const tbody = document.getElementById("reply-list");
  tbody.innerHTML = "";

  customReplies.forEach((reply, index) => {
    const tr = document.createElement("tr");

    const keywordTypeTd = document.createElement("td");
    keywordTypeTd.textContent = reply.keywordType;
    tr.appendChild(keywordTypeTd);

    const responseTypeTd = document.createElement("td");
    responseTypeTd.textContent = reply.responseType;
    tr.appendChild(responseTypeTd);

    const keywordsTd = document.createElement("td");
    keywordsTd.textContent = reply.keywords.join(", ");
    tr.appendChild(keywordsTd);

    const responsesTd = document.createElement("td");
    responsesTd.textContent = reply.responses.join(", ");
    tr.appendChild(responsesTd);

    const actionsTd = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-secondary mr-2";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => editReply(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-error";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteReply(index));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);
    tr.appendChild(actionsTd);

    tbody.appendChild(tr);
  });
}

function editReply(index) {
  const reply = customReplies[index];
  document.getElementById("keywordType").value = reply.keywordType;
  document.getElementById("responseType").value = reply.responseType;
  document.getElementById("keywords").value = reply.keywords.join(", ");
  document.getElementById("responses").value = reply.responses.join(", ");
  document.getElementById("saveReply").dataset.index = index;
  replyDialog.showModal();
}

function deleteReply(index) {
  if (!confirm("Are you sure you want to delete this reply?")) return;
  customReplies.splice(index, 1);
  saveAllReplies();
}

function saveAllReplies() {
  fetch("/api/custom-replies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customReplies),
  })
    .then((res) => res.json())
    .then(() => renderReplies())
    .catch((err) => alert("Failed to save replies: " + err));
}

document.getElementById("addReply").addEventListener("click", () => {
  document.getElementById("replyForm").reset();
  delete document.getElementById("saveReply").dataset.index;
});

document.getElementById("saveReply").addEventListener("click", () => {
  const keywordType = document.getElementById("keywordType").value;
  const responseType = document.getElementById("responseType").value;
  const keywords = document
    .getElementById("keywords")
    .value.split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const responses = document
    .getElementById("responses")
    .value.split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  const newReply = { keywordType, responseType, keywords, responses };

  const index = document.getElementById("saveReply").dataset.index;
  if (index !== undefined) {
    customReplies[index] = newReply;
  } else {
    customReplies.push(newReply);
  }

  saveAllReplies();
  replyDialog.close();
});

fetch("/api/custom-replies")
  .then((res) => res.json())
  .then((data) => {
    customReplies = data;
    renderReplies();
  })
  .catch((err) => console.error("Failed to load replies:", err));
