function getParam(name) {
  const url = new URL(window.location);
  return url.searchParams.get(name);
}

function createSocketConnection() {
  const { origin } = window.location;
  const socketUrl = origin.endsWith(":3000")
    ? origin.replace("3000", "5000")
    : origin.concat(":5000");

  return io(socketUrl);
}
