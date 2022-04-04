"use strict";

import DataBase from '../models/DataBase.js';
import DateTime from '../helpers/DateTime.js';

/**
 * Class with responsability to process and validated
 * data what's come from routes and interact with model
 * to make a response to request
 */
class APIController {

    /**
     * Method only to check if all is working
     * 
     * @returns json object
     */

    static testEndpoint(req, res) {

        try{

            res.json({
                    status: 'API ENDPOINT WORKING!',
                    made_by: "Alex censored <censored@gmail.com>",
                    forked_by: "Houmar Passareli <houmarpassarelli@gmail.com>",
                    github: "https://github.com/censored",
                    about: "API made for the back-end developer selective process"
            });

        }catch(error){

            res.status(500).json({
                status: "ERROR",
                about: "Internal error!",
                solution: "There's a internal problem, please contact the system administrator"
            });

        }
    }

    /**
     * Method with responsability to return the
     * rules of scheduling
     * 
     * @returns json object
     */
    static async getRules(req, res) {

        try{

            let rules = await DataBase.getRules();

            res.json(rules);

        }catch(error){

            res.status(500).json({
                status: "ERROR",
                about: "Internal error!",
                solution: "There's a internal problem, please contact the system administrator"
            });

        }
    }

    /**
     * Method with responsability to get intervals days
     * to scheduling
     * 
     * @param string day_start
     * @param string day_end
     * @returns json object
     */
    static async getAvailableDayIntervals(req, res) {

        try{

            let { day_start, day_end } = req.body;

            if (!day_start || !day_end) {
                return res.status(400).json({
                    status: "ERROR",
                    about: "Malformed request!",
                    solution: "your body x-www-form-urlencoded must contain keys: 'day_start' AND 'day_end'"
                });
            }

            if (!DateTime.dateFormatIsValid(day_start)) {
                return res.status(406).json({
                    status: "ERROR",
                    about: "Invalid date format!",
                    solution: "day_start must by like dd-mm-yyyy"
                });
            }

            if (!DateTime.dateFormatIsValid(day_end)) {
                return res.status(406).json({
                    status: "ERROR",
                    about: "Invalid date format!",
                    solution: "day_end must by like dd-mm-yyyy"
                });
            }

            let intervals_availables = await DataBase.getDaysIntervalsAvailables(day_start, day_end);

            if (intervals_availables.length) {
                return res.status(406).json(intervals_availables);
            } 

            res.json({ 
                status: "UNAVAILABLE",
                about: "Unavailable interval!",
                solution: `There's no intervals available from dates: '${day_start}' to '${day_end}'` 
            });

        }catch(error){
            res.status(500).json({
                status: "ERROR",
                about: "Internal error!",
                solution: "There's a internal problem, please contact the system administrator"
            });
        }
    }

    /**
     * Method with responsability to create a new
     * interval time of a day rule
     * 
     * @param string day
     * @param string interval_start
     * @param string interval_end
     * @returns json object
     */
    static async postCreateSpecificDayIntervalRule(req, res) {

        try{

            let { day, interval_start, interval_end } = req.body;

            if (!day || !interval_start || !interval_end) {
    
                return res.status(400).json({
                    status: "ERROR",
                    about: "Malformed request!",
                    solution: "your body x-www-form-urlencoded must contain keys: 'day', interval_start' AND 'interval_end'"
                });
            }
    
            if (!DateTime.dateFormatIsValid(day)) {
    
                return res.status(406).json({
                    status: "ERROR",
                    about: "Invalid date format!",
                    solution: "day must by like dd-mm-yyyy"
                });
            }
    
            let invalid_time_format = await APIController.validTimeFormat(interval_start, interval_end);
    
            if (invalid_time_format) {
                return res.status(406).json(invalid_time_format);
            }
    
            let specificDayIntervalRule = await DataBase.storeSpecificDayIntervalRule(day, interval_start, interval_end);
    
            res.json(specificDayIntervalRule);

        }catch(error){
            res.status(500).json({
                status: "ERROR",
                about: "Internal error!",
                solution: "There's a internal problem, please contact the system administrator"
            });
        }
    }

    /**
     * Method with responsability to create a new
     * days interval rule
     * 
     * @param string interval_start
     * @param string interval_end
     * @returns json object
     */
    static async postCreateDailyIntervalRule(req, res) {

        try{

            let { interval_start, interval_end } = req.body;

            if (!interval_start || !interval_end) {
    
                return res.status(400).json({
                    status: "ERROR",
                    about: "Malformed request!",
                    solution: "your body x-www-form-urlencoded must contain keys: 'interval_start' AND 'interval_end'"
                });
            }
    
            let invalid_time_format = await APIController.validTimeFormat(interval_start, interval_end);
    
            if (invalid_time_format){
                return res.status(406).json(invalid_time_format);
            } 
    
            let daily_interval_rule = await DataBase.storeDailyIntervalRule(interval_start, interval_end);
    
            res.json(daily_interval_rule);

        }catch(error){
            res.status(500).json({
                status: "ERROR",
                about: "Internal error!",
                solution: "There's a internal problem, please contact the system administrator"
            });
        }
    }

    /**
     * Method with responsability to create a new
     * week interval rule
     * 
     * @param string day_of_the_week_name
     * @param string interval_start
     * @param string interval_end
     * @returns json object
     */
    static async postCreateWeeklyIntervalRule(req, res) {

        try{

            let { day_of_the_week_name, interval_start, interval_end } = req.body;

            if (!day_of_the_week_name || !interval_start || !interval_end) {
    
                return res.status(400).json({
                    status: "ERROR",
                    about: "Malformed request!",
                    solution: "your body x-www-form-urlencoded must contain keys: 'day_of_the_week_name', 'interval_start' AND 'interval_end'"
                });
            }
    
            let available_days_week_names = ['segundas', 'tercas', 'quartas', 'quintas', 'sextas'];
    
            if (!available_days_week_names.includes(day_of_the_week_name)) {
                return res.status(406).json({
                    status: "ERROR",
                    about: "Invalid day_of_the_week name!",
                    solution: 'day_of_the_week_name can be: segundas, terças, quartas, quintas or sextas'
                })
            }
    
            let invalid_time_format = await APIController.validTimeFormat(interval_start, interval_end);
    
            if (invalid_time_format) {
                return res.status(406).json(invalid_time_format);
            } 
    
            let weekly_interval_rule = await DataBase.storeWeeklyIntervalRule(day_of_the_week_name, interval_start, interval_end)
    
            res.json(weekly_interval_rule);

        }catch(error){
            res.status(500).json({
                status: "ERROR",
                about: "Internal error!",
                solution: "There's a internal problem, please contact the system administrator"
            });
        }
    }

    /**
     * Method with responsability to delete
     * a rule
     * 
     * @param string rule_type
     * @param string rule_id
     * @param string interval_id
     * @returns json object
     */
    static async deleteRule(req, res) {

        try{

            let { rule_type, rule_id, interval_id } = req.body;

            if (!rule_type || !rule_id) {
    
                return res.status(400).json({
                    status: "ERROR",
                    about: "Malformed request!",
                    solution: "your body x-www-form-urlencoded must contain keys: 'rule_type' AND 'rule_id' at least"
                });
            }
    
            let available_rule_types = ['specific_days', 'daily', 'weekly'];
    
            if (!available_rule_types.includes(rule_type)) {
    
                return res.status(406).json({
                    status: "ERROR",
                    about: "Invalid 'rule_type' name!",
                    solution: "rule_type can be: 'specific_days', 'daily' or 'weekly'"
                });
            }
    
            let deleted_rule_response = await DataBase.deleteRuleObjectOrInterval(rule_type, rule_id, interval_id);
    
            res.json(deleted_rule_response);

        }catch(error){
            res.status(500).json({
                status: "ERROR",
                about: "Internal error!",
                solution: "There's a internal problem, please contact the system administrator"
            });
        }
    }

    /**
     * Middleware with responsability to talk with DateTime Helper
     * to validate the time formar
     * 
     * @param string interval_start 
     * @param string interval_end 
     * @returns boolean | object
     */
    static async validTimeFormat(interval_start, interval_end) {

        if (!DateTime.timeFormatIsValid(interval_start)) {

            return {
                status: "ERROR",
                about: "Invalid time format!",
                solution: "Interval_start must by like HH:MM (like 14:30)"
            };
        }

        if (!DateTime.timeFormatIsValid(interval_end)) {

            return {
                status: "ERROR",
                about: "Invalid time format!",
                solution: "Interval_end must by like HH:MM (like 15:30)"
            };
        }

        return false;
    }
}

export default APIController;