const DB = "fieldseal-demo-v1";
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("state");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function read<T>(key: string, fallback: T): Promise<T> {
  const d = await open();
  return new Promise((resolve, reject) => {
    const r = d.transaction("state").objectStore("state").get(key);
    r.onsuccess = () => {
      d.close();
      resolve(r.result ?? fallback);
    };
    r.onerror = () => {
      d.close();
      reject(r.error);
    };
  });
}
export async function write(key: string, value: unknown): Promise<void> {
  const d = await open();
  return new Promise((resolve, reject) => {
    const t = d.transaction("state", "readwrite");
    t.objectStore("state").put(value, key);
    t.oncomplete = () => {
      d.close();
      resolve();
    };
    t.onerror = () => {
      d.close();
      reject(t.error);
    };
  });
}
