import type { SocketTransport } from "./socket-router";

export function createSocketlibTransport(value: unknown): SocketTransport | null {
  if (!value || typeof value !== "object" || !("registerModule" in value)) return null;
  const api = value as { registerModule: (namespace: string) => unknown };
  const socket = api.registerModule("darkis-godforge");
  if (!socket || typeof socket !== "object" || !("register" in socket) || !("executeAsGM" in socket)) return null;
  type SocketHandler = (this: { socketdata?: { userId?: string } }, payload: unknown) => Promise<unknown>;
  const channel = socket as { register: (name: string, handler: SocketHandler) => void; executeAsGM: (name: string, payload: unknown) => Promise<unknown> };
  return {
    register: (name, handler) => channel.register(name, async function (payload) {
      const senderId = this.socketdata?.userId;
      if (!senderId) throw new Error("Socketlib did not provide an authenticated sender.");
      return handler(payload, senderId);
    }),
    executeAsGM: (name, payload) => channel.executeAsGM(name, payload)
  };
}
