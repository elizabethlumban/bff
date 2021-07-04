export const isDev = () =>
  !process.env.NODE_ENV || process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev";

export const isStaging = () =>
  !isDev() && (process.env.APPLICATION_ENVIRONMENT === "staging" || process.env.NODE_ENV === "sit");

export const isProd = () => !isDev() && !isStaging();

export const envName = () => {
  if (isDev()) {
    return "dev";
  } else if (isStaging()) {
    return "sit";
  } else if (isProd()) {
    return "prod";
  }
};
