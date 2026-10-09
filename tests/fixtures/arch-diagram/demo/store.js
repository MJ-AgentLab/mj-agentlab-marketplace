const records = new Map([['/item',{id:1}]]);
export function lookup(key) {
  return records.get(key) ?? null;
}
