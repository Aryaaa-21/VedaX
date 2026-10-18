const log = (level, message, metadata = {}) => {
  const safeMetadata = { ...metadata };
  delete safeMetadata.password;
  delete safeMetadata.token;
  delete safeMetadata.authorization;
  delete safeMetadata.body;

  const line = JSON.stringify({
    level,
    message,
    ...safeMetadata,
    timestamp: new Date().toISOString()
  });

  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
};

module.exports = { log };
