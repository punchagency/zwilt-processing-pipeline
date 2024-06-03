export const dbString =
  process.env.MONGODB_NODE_ENV === 'production'
    ? process.env.ZWILT_MONGODB_PROD
    : process.env.ZWILT_MONGODB_DEV;
