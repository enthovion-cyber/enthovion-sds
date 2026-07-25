const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const hash = async (plainText) => {
  return bcrypt.hash(plainText, SALT_ROUNDS);
};

const compare = async (plainText, hashed) => {
  return bcrypt.compare(plainText, hashed);
};

module.exports = { hash, compare };
