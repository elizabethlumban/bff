export function createUrlQuery(data: any) {
  return Object.keys(data)
    .map(key =>
      Array.isArray(data[key])
        ? data[key].map((v: string) => `${key}=${v}`).join("&")
        : `${key}=${data[key]}`
    )
    .join("&");
}
