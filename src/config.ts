import * as dotenv from 'dotenv';

dotenv.config();

const jwtSecretFromEnv = process.env.JWT_SECRET;

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

// Server-side secret mixed into every password hash (see user/password.ts).
// Keep it out of the database and back it up: changing or losing it makes
// every stored password unverifiable.
const passwordPepperFromEnv = process.env.PASSWORD_PEPPER;

if (!passwordPepperFromEnv) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'PASSWORD_PEPPER is not set. Define it in the environment before starting the app.',
    );
  }
  console.warn(
    'PASSWORD_PEPPER is not set, falling back to an insecure development pepper. Copy .env.example to .env and set your own value.',
  );
}

export const PASSWORD_PEPPER =
  passwordPepperFromEnv ?? 'dev-only-insecure-password-pepper';
