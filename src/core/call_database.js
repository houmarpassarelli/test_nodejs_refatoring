"use strict";

import fs from 'fs-extra';

const json_database = JSON.parse(fs.readFileSync(process.env.JSON_DATABASE_FILE));

export default json_database;