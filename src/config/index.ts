export default () => {
  const envs: Record<string, any> = {};
  try {
    const defaultEnv = require(`./default`);
    Object.assign(envs, defaultEnv);
  } catch (error) {}
  try {
    if (process.env.NODE_ENV) {
      const targetEnvs = require(`./${process.env.NODE_ENV}`);
      Object.assign(envs, targetEnvs);
    }
  } catch (error) {}
  return envs;
};
