// biome-ignore lint/correctness/noUnusedImports: Required for JSX
import { Html } from "@elysiajs/html";

export function Navbar() {
  return (
    <div class="navbar bg-base-300 shadow-sm">
      <div class="navbar-start">
        <div class="dropdown">
          <div class="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Button</title>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <p>Managers</p>
              <ul class="p-2">
                <li>
                  <a href="/manager/commands">Commands</a>
                </li>
                <li>
                  <a href="/manager/channel-points">Channel Points</a>
                </li>
                <li>
                  <a href="/manager/replies">Replies</a>
                </li>
              </ul>
            </li>
            <li>
              <p>Overlays</p>
              <ul class="p-2">
                <li>
                  <a href="/overlay/chat">Chat</a>
                </li>
                <li>
                  <a href="/overlay/feed">Feed</a>
                </li>
                <li>
                  <a href="/overlay/music">Music</a>
                </li>
              </ul>
            </li>
            <li>
              <p>Soundboard</p>
              <ul class="p-2">
                <li>
                  <a href="/soundboard/controller">Controller</a>
                </li>
                <li>
                  <a href="/soundboard/player">Player</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="/queue">Music Queue</a>
            </li>
          </ul>
        </div>
        <a class="btn btn-ghost text-xl" href="/">
          Manao
        </a>
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <li>
            <details>
              <summary>Managers</summary>
              <ul class="z-[99999] p-2 shadow-md">
                <li>
                  <a href="/manager/commands">Commands</a>
                </li>
                <li>
                  <a href="/manager/channel-points">Channel Points</a>
                </li>
                <li>
                  <a href="/manager/replies">Replies</a>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>Overlays</summary>
              <ul class="z-[99999] p-2 shadow-md">
                <li>
                  <a href="/overlay/chat">Chat</a>
                </li>
                <li>
                  <a href="/overlay/feed">Feed</a>
                </li>
                <li>
                  <a href="/overlay/music">Music</a>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>Soundboard</summary>
              <ul class="z-[99999] p-2 shadow-md">
                <li>
                  <a href="/soundboard/controller">Controller</a>
                </li>
                <li>
                  <a href="/soundboard/player">Player</a>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <a href="/queue">Music Queue</a>
          </li>
        </ul>
      </div>
      <div class="navbar-end">
        <a class="btn btn-success" href="https://github.com/sponsors/tinarskii">
          Donate
        </a>
      </div>
    </div>
  );
}
