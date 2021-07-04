export interface IDictionary<T> {
  [key: string]: T;
}

// eslint-disable-next-line
export type SameKeyDictionary<K, V> = {
  [key in keyof K]?: V;
};
