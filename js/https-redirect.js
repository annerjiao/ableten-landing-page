/**
 * Fallback redirect to canonical origin (https://ableten.xyz).
 * Server-side 301 via GitHub Pages "Enforce HTTPS" is preferred — enable in repo Settings → Pages.
 */
(function () {
  var CANONICAL = "ableten.xyz";
  var host = location.hostname;
  var port = location.port;

  var isDevServer =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host.endsWith(".local") ||
    (port && port !== "80" && port !== "443");

  if (isDevServer) {
    return;
  }

  var needsRedirect =
    location.protocol === "http:" || host === "www." + CANONICAL;

  if (needsRedirect) {
    location.replace(
      "https://" +
        CANONICAL +
        location.pathname +
        location.search +
        location.hash
    );
  }
})();
