const fs = require("fs");

/**
 * @typedef AppState
 * @type {object}
 * @property {{ [name: string]: { attacksCount: number; defensesCount: number; } }} attacks
 * @property {Date} lastUpdate
 */

/**
 * @returns {AppState}
 */
function getState() {
  const txt = fs.readFileSync("./state.json", { encoding: "utf-8" });
  return JSON.parse(txt);
}

/**
 *
 * @param {AppState} state
 */
function setState(state) {
  state.lastUpdate = new Date();
  fs.writeFileSync("./state.json", JSON.stringify(state, null, 2), { encoding: "utf-8" });
}

module.exports = {
  getState,
  setState,
};
