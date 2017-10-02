module.exports = {
  "development": {
    "dialect":  "postgres",
    "host":     "localhost",
    "username": "quackbot",
    "password": "38TXXcALgH6NdaxqesqiDPzNEG9zucNG",
    "database": "quackbot_development"
  },
  "test": {
    "dialect":  "postgres",
    "host":     "localhost",
    "username": "quackbot",
    "password": "",
    "database": "quackbot_test",
  },
  "production": {
    "dialect":  "postgres",
    "host":     process.env.DB_HOSTNAME,
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME
  }
};
