// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved

class TimeSpan {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    constructor(years?:number, months?:number, days?:number,
        hours?:number, minutes?:number, seconds?:number) {
        this.years = years;
        this.months = months;
        this.days = days;
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
    }
    toString() {

    }
}

export {
    TimeSpan
};