// biome-ignore lint/correctness/noUnusedImports: Required for JSX
import { Html } from "@elysiajs/html";

export function Chat() {
  return (
    <>
      <div class="sl__chat__layout" id="log"></div>
      <div id="template-container" style="display: none"></div>
    </>
  );
}
