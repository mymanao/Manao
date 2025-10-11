// biome-ignore lint/correctness/noUnusedImports: Required for JSX
import { Html } from "@elysiajs/html";
import { Navbar } from "@server/app/fragments/Navbar.tsx";
import { Footer } from "./fragments/Footer.tsx";

type PageOptions = {
  title?: string;
  excludeTemplate?: boolean;
  excludeTailwind?: boolean;
  includeStyles?: string[];
  includeScripts?: string[];
};

export function Template(page: JSX.Element, options: PageOptions = {}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{options.title ?? "Manao Website"}</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
        />
        {!options.excludeTailwind ? (
          <link rel="stylesheet" href="/css/dist/tailwind.css" />
        ) : null}
        {options.includeStyles?.map((style) => (
          <link rel="stylesheet" href={`/css/${style}`} />
        ))}
        <script src="/scripts/socket.io/socket.io.js"></script>
      </head>
      <body>
        {options.excludeTemplate ? (
          page
        ) : (
          <div class="min-h-screen flex flex-col">
            <Navbar />
            {page}
            <Footer />
          </div>
        )}
      </body>
      <script src="/scripts/common.js"></script>
      {options.excludeTemplate ? (
        ""
      ) : (
        <script src="/scripts/background.js"></script>
      )}
      {options.includeScripts?.map((script) =>
        script.startsWith("http") ? (
          <script src={script} />
        ) : (
          <script src={`/scripts/${script}`} />
        ),
      )}
    </html>
  );
}
