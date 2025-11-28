export const getConfig = () => {
  const config = {
    PORT: parseInt(process.env.PORT || "5000", 10),
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE || "24h",
    FLASK_API_URL: process.env.FLASK_API_URL || "http://localhost:5001",
    FLASK_API_TIMEOUT: parseInt(process.env.FLASK_API_TIMEOUT || "30000", 10),
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: parseInt(process.env.SMTP_PORT || "465", 10),
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_SECURE: process.env.SMTP_SECURE === "true",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
  };

  return config;
};

export const validateConfig = (): void => {
  const config = getConfig();

  const requiredFields = [
    "DATABASE_URL",
    "DIRECT_URL",
    "JWT_SECRET",
    "FLASK_API_URL",
  ];

  const missing = requiredFields.filter(
    (field) => !config[field as keyof typeof config]
  );

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  console.log("✅ Environment configuration validated");
};

export default getConfig();
