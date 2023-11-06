import forge from "node-forge";

import { getData, setData } from "./store";
import { Channel, User } from "./types";

export function createChannel(user: User) {
  const channelId = forge.util.bytesToHex(forge.random.getBytesSync(12));
  const secret = btoa(forge.random.getBytesSync(32));
  const channel: Channel = {
    id: channelId,
    secret,
    user,
  };

  setData(`c:${user.username}`, channel);

  return channel;
}

export function getChannel(user: User) {
  const channel = getData(`c:${user.username}`);
  if (!channel) {
    return null;
  }

  return channel as Channel;
}
