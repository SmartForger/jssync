import forge from "node-forge";

import { getData, setData } from "./store";
import { Channel, User } from "./types";

let c = 0;

export function createChannel(user: User) {
  const channelId = forge.util.bytesToHex(forge.random.getBytesSync(12));
  const secret = btoa(forge.random.getBytesSync(32));
  const channel: Channel = {
    id: channelId,
    secret,
    user,
  };

  setData(`c:${user.username}`, channel);
  setData(`ci:${channelId}`, channel);

  console.log('Channel created: ', ++c);

  return channel;
}

export function getChannel(user: User) {
  const channel = getData(`c:${user.username}`);
  if (!channel) {
    return null;
  }

  return channel as Channel;
}

export function getChannelById(cid: string) {
  const channel = getData(`ci:${cid}`);
  if (!channel) {
    return null;
  }

  return channel as Channel;
}
