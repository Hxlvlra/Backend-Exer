const { readFileSync } = require('fs');

/**
 * This reads the file and gets the tasks
 *
 * @param {string} filename
 * @param {string} encoding
 * @returns {[{ done: boolean, id: string, text: string }]}
 */
exports.getTasks = (filename, encoding) => {
  const databaseString = readFileSync(filename, encoding);
  const database = JSON.parse(databaseString);
  const { tasks } = database;
  return tasks;
}
