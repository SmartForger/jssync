const store = new Map<string, any>();

export function setData(key: string, data: any) {
  store.set(key, data);
}

export function getData(key: string) {
  return store.get(key);
}
