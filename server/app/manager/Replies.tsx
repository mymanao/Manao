// biome-ignore lint/correctness/noUnusedImports: Required for JSX
import { Html } from "@elysiajs/html";

export function CustomReplies() {
  return (
    <main class="w-full min-h-screen flex flex-col gap-6 px-2 lg:px-6 py-12">
      <div class="flex flex-row justify-between items-center">
        <h1 class="text-4xl font-bold">Custom Replies Manager</h1>
        <button
          type="button"
          class="btn btn-success"
          id="addReply"
          onclick="replyDialog.showModal()"
        >
          Add Reply
        </button>
      </div>

      <div class="min-h-screen bg-base-300 rounded-xl">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>Keyword Type</th>
              <th>Response Type</th>
              <th>Keywords</th>
              <th>Responses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="reply-list"></tbody>
        </table>
      </div>

      <dialog id="replyDialog" class="modal">
        <div class="modal-box">
          <h3 class="text-lg font-bold">Custom Reply</h3>
          <form id="replyForm" class="p-4 flex flex-col gap-6 w-full">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Keyword Type:</legend>
              <select id="keywordType" class="select select-bordered w-full">
                <option value="includes">Includes</option>
                <option value="equals">Equals</option>
              </select>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Response Type:</legend>
              <select id="responseType" class="select select-bordered w-full">
                <option value="random">Random</option>
                <option value="sequence">Sequence</option>
              </select>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">
                Keywords (comma separated):
              </legend>
              <input
                type="text"
                id="keywords"
                class="input w-full"
                placeholder="hello, hi, hey"
              />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">
                Responses (comma separated):
              </legend>
              <input
                type="text"
                id="responses"
                class="input w-full"
                placeholder="Hello there!, Hi!, Hey you!"
              />
            </fieldset>

            <div class="flex flex-row w-full gap-2 justify-end items-center">
              <button type="button" class="btn btn-success" id="saveReply">
                Save
              </button>
              <button type="button" class="btn" onclick="replyDialog.close()">
                Close
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </main>
  );
}
