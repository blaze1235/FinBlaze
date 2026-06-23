import net from "net";

/**
 * Sends a single-line command to a gaming PC daemon on port 8888.
 * Resolves with the ACK string (e.g. "ACK_LOCKED").
 * Rejects on timeout, ECONNREFUSED, or EHOSTUNREACH.
 */
export function sendLanCommand(ipAddress, command, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let buffer = "";
    let settled = false;

    const done = (fn, value) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      fn(value);
    };

    socket.setTimeout(timeoutMs);

    socket.connect(8888, ipAddress, () => {
      socket.write(command + "\n");
    });

    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      if (buffer.includes("\n")) {
        done(resolve, buffer.trim());
      }
    });

    socket.on("timeout", () => done(reject, Object.assign(new Error("Connection timed out"), { code: "ETIMEDOUT" })));
    socket.on("error", (err) => done(reject, err));
    socket.on("close", () => {
      if (!settled) done(reject, new Error("Connection closed without ACK"));
    });
  });
}

export function lanErrorToHttp(err) {
  if (err.code === "ECONNREFUSED") return { status: 503, error: "PC unreachable — daemon not running", detail: err.code };
  if (err.code === "ETIMEDOUT")    return { status: 504, error: "PC not responding — may be offline or firewalled", detail: err.code };
  if (err.code === "EHOSTUNREACH") return { status: 503, error: "PC not on LAN — check network connection", detail: err.code };
  return { status: 500, error: err.message, detail: err.code };
}
