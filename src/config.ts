import * as dotenv from 'dotenv';

dotenv.config();

const jwtSecretFromEnv = process.env.JWT_SECRET;

console.log('jwtSecretFromEnv', jwtSecretFromEnv);

if (!jwtSecretFromEnv) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is not set. Define it in the environment before starting the app.',
    );
  }
  console.warn(
    'JWT_SECRET is not set, falling back to an insecure development secret. Copy .env.example to .env and set your own value.',
  );
}

export const JWT_SECRET = jwtSecretFromEnv ?? 'dev-only-insecure-jwt-secret';
