export const PLATFORM_ENVIRONMENT = {
  DEV: 'dev',
  UAT: 'uat',
  PROD: 'prod',
  TEST: 'test',
  LOCAL: 'local',
  STAGE: 'stage',
};

export type PlatformEnvironment =
  (typeof PLATFORM_ENVIRONMENT)[keyof typeof PLATFORM_ENVIRONMENT];
