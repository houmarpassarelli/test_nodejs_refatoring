"use strict";

class DateTime {

    /**
     * Method that convert time to integer
     * 
     * @param string timeString 
     * @returns int
     */
    static convertTimeToInt(timeString) {

        let intTime = parseInt(timeString.replace(':', ''));

        return intTime;
    }

    /**
     * Method that checks if dates are equivalent
     * 
     * @param string firstDate 
     * @param string lastDate 
     * @returns boolean
     */
    static equalTo(firstDate, lastDate) {

        let utcFirstDate = firstDate.split("-").reverse().join("-");
        let utcLastDate = lastDate.split("-").reverse().join("-");

        if (utcFirstDate === utcLastDate) {
            return true;
        }

        return false;
    }

    /**
     * Method that checks if the start date is equal 
     * to or greater than the end date
     * 
     * @param string dayStart 
     * @param string dayEnd 
     * @returns boolean
     */
    static greaterOrEqualTo(dayStart, dayEnd) {

        let utcDayStart = dayStart.split("-").reverse().join("-");
        let utcDayEnd = dayEnd.split("-").reverse().join("-");

        utcDayStart = new Date(utcDayStart);
        utcDayEnd = new Date(utcDayEnd);

        if (utcDayStart >= utcDayEnd) {
            return true;
        }

        return false;
    }

    /**
     * Method that checks if the start date is equal 
     * to or less than the end date
     * 
     * @param string dayStart 
     * @param string dayEnd 
     * @returns boolean
     */
    static lessOrEqualTo(dayStart, dayEnd) {

        try{

            let utcDayStart = dayStart.split("-").reverse().join("-");
            let utcDayEnd = dayEnd.split("-").reverse().join("-");
    
            utcDayStart = new Date(utcDayStart);
            utcDayEnd = new Date(utcDayEnd);
    
            if (utcDayStart <= utcDayEnd) {
                return true;
            }
    
            return false;

        }catch(error){
            return false;
        }
    }

    /**
     * Method that change date integer reference to a string 
     * information 
     * 
     * @param string date 
     * @returns string | null
     */
    static getDayOfTheWeekName(date) {

        try{

            let utcDate = date.split("-").reverse().join("-");
            let dayOfTheWeek = new Date(utcDate).getDay();
    
            switch (dayOfTheWeek) {
                case 0:
                    return 'segundas';
                case 1:
                    return 'tercas';
                case 2:
                    return 'quartas';
                case 3:
                    return 'quintas';
                case 4:
                    return 'sextas';
                case 5:
                    return 'sábados';
                case 6:
                    return 'domingos';
                default:
                    return null;
            }

        }catch(error){
            return null;
        }
    }

    /**
     * Method that checks if is a valid date format
     * 
     * @param string date 
     * @returns boolean
     */
    static dateFormatIsValid(date) {

        try{

            let dateFormatRegex = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/;

            if (!dateFormatRegex.test(date)){
                return false;
            } 

            return true;

        }catch(error){
            return false;
        }
    }

}

export default DateTime;