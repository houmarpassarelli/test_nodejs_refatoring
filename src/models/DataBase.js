"use strict";

import fs from 'fs-extra';
import { uuidv4 } from 'uuidv4';

import DateTime from '../helpers/DateTime.js';
import jsonDataBase from '../core/call_database';


class DataBase {

    /**
     * Method with responsibility to persist data in the database
     * 
     * @param {*} database 
     */
    static save(database) {
        fs.writeFileSync(process.env.JSON_DATABASE_FILE, JSON.stringify(database, null, 2), error => {
            if (error) {
                throw new Error(error);
            }
        });
    }

    /**
     * Method with responsibility to check if 
     * there are time intervals available to persist
     * 
     * @param array array 
     * @param string interval_start 
     * @param string interval_end 
     * @returns boolean | json object
     */
    static intervalsTimesIsValidAndAvailableToStore(array, interval_start, interval_end) {

        try{

            if (!interval_start.includes(':') || 
                !interval_end.includes(':')){

                return { 
                    status: "ERROR",
                    about: "Malformed data",
                    solution: "mal formated interval time"
                };
            }

            if (interval_start.length < 4 || 
                interval_end.length < 4){
                return { 
                    status: "ERROR",
                    about: "Malformed data",
                    solution: "mal formated interval time"
                };
            }

            let int_start = DateTime.convertTimeToInt(interval_start);
            let int_end = DateTime.convertTimeToInt(interval_end);

            if (int_start < int_end) {

                return { 
                    status: "ERROR",
                    about: "Malformed data",
                    solution: "interval_end is less than interval_start"
                };
            }

            for (let i = 0; i < array.length; i++) {

                if (array[i].start === interval_start || 
                    array[i].end === interval_end) {

                        return { 
                            status: "ERROR",
                            about: "Malformed data",
                            solution: "Conflit between intervals available"
                        };
                }

                let int_daily_start = DateTime.convertTimeToInt(array[i].start);
                let int_daily_end = DateTime.convertTimeToInt(array[i].end);

                if (int_start >= int_daily_start && 
                    int_start <= int_daily_end) {

                    return {
                        status: "ERROR",
                        about: "Malformed data",
                        solution: "Conflit between intervals available"
                    };
                }

                if (int_end >= int_daily_start && int_end <= int_daily_end) {

                    return {
                        status: "ERROR",
                        about: "Malformed data",
                        solution: "Conflit between intervals available"
                    };
                }
            }

            return false;

        }catch(error){
            throw new Error(error);
        }
    }

    /**
     * Method with responsibility to get scheduling rules
     * 
     * @returns 
     */
    static async getRules() {

        try{

            let rules_response = {
                specific_days: [],
                daily: [],
                weekly: []
            };

            let daily_intervals_available = '';

            let weekly_intervals_available_object = {
                segundas: '',
                tercas: '',
                quartas: '',
                quintas: '',
                sextas: ''
            };

            //DAILY PROCESS
            if (jsonDataBase.daily.length) {

                for (let i = 0; i < jsonDataBase.daily.length; i++) {

                    if (jsonDataBase.daily.length >= 1 && i === jsonDataBase.daily.length - 1) {

                        daily_intervals_available += `${jsonDataBase.daily[i].start} até as ${jsonDataBase.daily[i].end}`;

                        break;
                    }

                    daily_intervals_available += `${jsonDataBase.daily[i].start} até as ${jsonDataBase.daily[i].end}, `;
                }

                rules_response.daily.push(`Estará disponível para atender todos os dias das: ${daily_intervals_available}`);
            }
            else { 
                rules_response.daily.push(`Não possui intervalos para atender todos os dias cadastrado`);
            }

            //WEEKLY PROCESS
            if (jsonDataBase.weekly.length) {

                jsonDataBase.weekly.forEach((dayOfTheWeekObject) => {

                    let weekly_intervals_available = '';

                    if (dayOfTheWeekObject.intervals.length) {

                        for (let i = 0; i < dayOfTheWeekObject.intervals.length; i++) {

                            if (dayOfTheWeekObject.intervals.length >= 1 && i === dayOfTheWeekObject.intervals.length - 1) {

                                weekly_intervals_available += `${dayOfTheWeekObject.intervals[i].start} até as ${dayOfTheWeekObject.intervals[i].end}`;

                                break;
                            }

                            weekly_intervals_available += `${dayOfTheWeekObject.intervals[i].start} até as ${dayOfTheWeekObject.intervals[i].end}, `;
                        }

                        weekly_intervals_available_object[dayOfTheWeekObject.day_of_the_week_name] = weekly_intervals_available;

                            rules_response.weekly.push(`Estará disponível para atender todas as ${dayOfTheWeekObject.day_of_the_week_name} nos intervalos de: ${weekly_intervals_available}`);

                    }else{
                        rules_response.weekly.push(`${dayOfTheWeekObject.day_of_the_week_name}: Não há intervalos cadastrados nesse dia da semana`);
                    }
                });

            }else{
                rules_response.weekly.push(`Não possui intervalos para atender semanalmente cadastrado`);
            }

            //SPECIFIC DAYS PROCESS
            if (jsonDataBase.specific_days.length) {

                jsonDataBase.specific_days.forEach((specificDayObject) => {

                    let specific_day_intervals_available = '';

                    for (let i = 0; i < specificDayObject.intervals.length; i++) {

                        if (specificDayObject.intervals.length >= 1 && i === specificDayObject.intervals.length - 1) {

                            specific_day_intervals_available += `${specificDayObject.intervals[i].start} até as ${specificDayObject.intervals[i].end}`;

                            break;
                        }

                        specific_day_intervals_available += `${specificDayObject.intervals[i].start} até ${specificDayObject.intervals[i].end}, `;
                    }

                    let specific_day_intervals_available_response = `Estará disponível para atender dia ${specificDayObject.day} nos intervalos de: ${daily_intervals_available}, 
                                                                ${weekly_intervals_available_object[specificDayObject.this_day_of_the_week_name]}, ${specific_day_intervals_available}`;

                    rules_response.specific_days.push(`${specific_day_intervals_available_response.replace(' ,', '').replace(' ,', '')}`);
                });

            }else{
                rules_response.specific_days.push(`Não possui intervalos para atender dias específicos cadastrado`);
            }

            return rules_response;
        }catch(error){
            throw new Error(error);
        }
    }

    /**
     * Method with responsibility to persist
     * a day interval rule
     * 
     * @param string day 
     * @param string interval_start 
     * @param string interval_end 
     * @returns json object
     */
    static async storeSpecificDayIntervalRule(day, interval_start, interval_end) {

        try {

            day = day.replace('/', '-').replace('/', '-');

            for (let i = 0; i < jsonDataBase.specific_days.length; i++) {

                if (jsonDataBase.specific_days[i].day === day) {

                    let error = await DataBase.intervalsTimesIsValidAndAvailableToStore(jsonDataBase.specific_days[i].intervals, interval_start, interval_end);

                    if(error){
                        return error;
                    }

                    jsonDataBase.specific_days[i].intervals.push({
                        interval_id: uuidv4(),
                        start: interval_start,
                        end: interval_end
                    });

                    await DataBase.save(jsonDataBase);

                    return jsonDataBase.specific_days[i];
                }
            }

            jsonDataBase.specific_days.push({
                rule_id: uuidv4(),
                day,
                this_day_of_the_week_name: DateTime.getDayOfTheWeekName(day),
                intervals: [{
                    interval_id: uuidv4(),
                    start: interval_start,
                    end: interval_end
                }]
            });

            await DataBase.save(jsonDataBase);

            return jsonDataBase.specific_days.pop();

        }catch(error){
            throw new Error(error);
        }
    }

    /**
     * Method with responsibility to persist
     * a daily interval rule
     * 
     * @param string interval_start 
     * @param string interval_end 
     * @returns json object
     */
    static async storeDailyIntervalRule(interval_start, interval_end) {

        try{

            let error = await DataBase.intervalsTimesIsValidAndAvailableToStore(jsonDataBase.daily, interval_start, interval_end);

            if(error){
                return error;
            }

            jsonDataBase.daily.push({
                rule_id: uuidv4(),
                start: interval_start,
                end: interval_end
            });

            await DataBase.save(jsonDataBase)

            return jsonDataBase.daily.pop();

        }catch(error){
            throw new Error(error);
        }
    }

    /**
     * Method with responsibility to persist
     * a weekly interval rule
     * 
     * @param string day_of_the_week_name 
     * @param string interval_start 
     * @param string interval_end 
     * @returns json object
     */
    static async storeWeeklyIntervalRule(day_of_the_week_name, interval_start, interval_end) {

        try{

            for (let i = 0; i < jsonDataBase.weekly.length; i++) {

                if (jsonDataBase.weekly[i].day_of_the_week_name === day_of_the_week_name) {

                    let error = await DataBase.intervalsTimesIsValidAndAvailableToStore(jsonDataBase.weekly[i].intervals, interval_start, interval_end);

                    if (error) {
                        return error;
                    } 

                    jsonDataBase.weekly[i].intervals.push(
                        {
                            interval_id: uuidv4(),
                            start: interval_start,
                            end: interval_end
                        }
                    );

                    await DataBase.save(jsonDataBase);

                    return jsonDataBase.weekly[i];
                }
            }

            jsonDataBase.weekly.push({                
                day_of_the_week_name,
                intervals: [
                    {
                        interval_id: uuidv4(),
                        start: interval_start,
                        end: interval_end
                    }
                ]
            });

            await DataBase.save(jsonDataBase);

            return jsonDataBase.weekly.pop();

        }catch(error){
            throw new Error(error);
        }
    }

    /**
     * Method with responsibility to delete
     * a object or interval rule
     * 
     * @param string rule_type 
     * @param string rule_id 
     * @param string interval_id 
     * @returns json object
     */
    static async deleteRuleObjectOrInterval(rule_type, rule_id, interval_id) {

        try{

            if (rule_type === 'specific_days') {

                if (interval_id) {

                    for (let i = 0; i < jsonDataBase.specific_days.length; i++) {

                        if (jsonDataBase.specific_days[i].rule_id === rule_id) {

                            for (let index = 0; index < jsonDataBase.weekly[i].intervals.length; index++) {

                                if (jsonDataBase.weekly[i].intervals[index].interval_id === interval_id) {

                                    jsonDataBase.weekly[i].intervals.splice(index, 1);

                                    await DataBase.save(jsonDataBase);

                                    return {
                                        status: "SUCCESS",
                                        about: "Deleted interval_id!",
                                        rule_type, 
                                        rule_id, 
                                        interval_id 
                                    };
                                }
                            }

                            return {
                                status: "ERROR", 
                                about: "interval_id not found!",
                                solution: "interval_id to delete not found"
                            };
                        }
                    }
                }

                for (let i = 0; i < jsonDataBase.specific_days.length; i++) {

                    if (jsonDataBase.specific_days[i].rule_id === rule_id) {

                        jsonDataBase.specific_days.splice(i, 1);

                        await DataBase.save(jsonDataBase);

                        return { 
                            status: "SUCCESS",
                            about: "Deleted rule!",
                            rule_type, 
                            rule_id
                        };
                    }
                }

                return { 
                    status: "ERROR", 
                    about: "rule_id not found!",
                    solution: "rule_id is not present"
                };

            }else if (rule_type === 'daily') {

                for (let i = 0; i < jsonDataBase.daily.length; i++) {

                    if (jsonDataBase.daily[i].rule_id === rule_id) {

                        jsonDataBase.daily.splice(i, 1);

                        await DataBase.save(jsonDataBase);

                        return {
                            status: "SUCCESS",
                            about: "Deleted rule!",
                            rule_type, 
                            rule_id
                        };
                    }
                }

                return {
                    status: "ERROR", 
                    about: "rule_id not found!",
                    solution: "rule_id is not present"
                };
            }else if (rule_type === 'weekly') {

                if (interval_id) {

                    for (let i = 0; i < jsonDataBase.weekly.length; i++) {

                        if (jsonDataBase.weekly[i].rule_id === rule_id) {

                            for (let index = 0; index < jsonDataBase.weekly[i].intervals.length; index++) {

                                if (jsonDataBase.weekly[i].intervals[index].interval_id === interval_id) {

                                    jsonDataBase.weekly[i].intervals.splice(index, 1);

                                    await DataBase.save(jsonDataBase);

                                    return {
                                        status: "SUCCESS",
                                        about: "Deleted interval_id!",
                                        rule_type,
                                        rule_id,
                                        interval_id
                                    };
                                }
                            }

                            return {
                                status: "ERROR", 
                                about: "interval_id not found!",
                                solution: "interval_id to delete not found"
                            };
                        }
                    }
                }
                else {
                    return {
                        status: "ERROR", 
                        about: "Can't delete rule_id!",
                        solution: "you can't delete rule_id from rule_type weekly, you can only delete interval_id from rule_type weekly"
                    };
                }
            }

            return {
                status: "ERROR", 
                about: "rule_type invalid!",
                solution: "rule_type invalid is not valid!"
            };

        }catch(error){
            throw new Error(error);
        }
    }

    /**
     * Method with responsibility to return
     * available days intervals
     * 
     * @param string day_start 
     * @param string day_end 
     * @returns array object
     */
    static async getDaysIntervalsAvailables(day_start, day_end) {

        day_start = day_start.replace('/', '-').replace('/', '-');
        day_end = day_end.replace('/', '-').replace('/', '-');

        let days_intervals_availables = [];

        for (let i = 0; i < jsonDataBase.specific_days.length; i++) {

            if (DateTime.greaterOrEqualTo(jsonDataBase.specific_days[i].day, day_start) &&
                DateTime.lessOrEqualTo(jsonDataBase.specific_days[i].day, day_end)) {

                let specificDay = jsonDataBase.specific_days[i].day;

                let intervals = [];

                jsonDataBase.specific_days[i].intervals.forEach((interval) => {
                    intervals.push({
                        start: interval.start,
                        end: interval.end
                    });
                });

                jsonDataBase.daily.forEach((intervalObject) => {
                    intervals.push({
                        start: intervalObject.start,
                        end: intervalObject.end
                    });
                });

                let day_of_the_week_name = DateTime.getDayOfTheWeekName(specificDay);

                jsonDataBase.weekly.forEach((object) => {

                    if (object.day_of_the_week === day_of_the_week_name) {

                        object.intervals.forEach((interval) => {

                            intervals.push({
                                start: interval.start,
                                end: interval.end
                            });
                        });
                    }
                });

                days_intervals_availables.push({
                    day: specificDay,
                    intervals
                });
            }
        }

        return days_intervals_availables;
    }
}

export default DataBase;