// tools/index.js
// Registro central de herramientas. Ari decide usarlas desde core/planner.js.

'use strict';

const calculator = require('./calculator');
const codeExecutor = require('./code_executor');
const fileReader = require('./file_reader');
const apiConnector = require('./api_connector');
const webSearch = require('./web_search');

const tools = new Map([
  [calculator.name, calculator],
  [codeExecutor.name, codeExecutor],
  [fileReader.name, fileReader],
  [apiConnector.name, apiConnector],
  [webSearch.name, webSearch]
]);

function get(name) { return tools.get(name); }
function list() { return [...tools.keys()]; }

module.exports = { get, list, tools };
