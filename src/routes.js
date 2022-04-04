"use strict";

import APIController from './controllers/APIController.js';

export default(router, uri) => {

    router
        .get(`${uri}/test`, APIController.testEndpoint)
        .get(`${uri}/rules`, APIController.getRules)
        .get(`${uri}/available`, APIController.getAvailableDayIntervals)
        .post(`${uri}/create/specificDay`, APIController.postCreateSpecificDayIntervalRule)
        .post(`${uri}/create/daily`, APIController.postCreateDailyIntervalRule)
        .post(`${uri}/create/weekly`, APIController.postCreateWeeklyIntervalRule)
        .delete(`${uri}/rule`, APIController.deleteRule);
};