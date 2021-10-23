// ==UserScript==
// @name         Calculate blockfarm exchange date
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  calculates if the plant harvest time is before or after the next exchange day
// @author       jaacu
// @match        https://blockfarm.club/farm/*
// @icon         https://www.google.com/s2/favicons?domain=blockfarm.club
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    Date.prototype.addDays = function (days) {
        this.setDate(this.getDate() + parseInt(days));
        return this;
    };

    const extraWords = "Harvest on : ";
    const exchangeDay = 2; // Numeric day of the week the exange day, starts at sunday = 0

    /**
     * Parses a utc date string into a utc date obj
     *
     * @param stringDate A date string in the format YYYY-MM-DD HH:mm:ss. Example: 2021-10-25 00:48:38
     * @returns Date The utc date obj
     */
    let parseStringToUtcDate = (stringDate) => {
        let parts = stringDate.split(' ')
        let firstHalf = parts[0].split('-');
        let secondHalf = parts[1].split(':');
        let tempDate = new Date();
        tempDate.setUTCFullYear(firstHalf[0]);
        tempDate.setUTCMonth(parseInt(firstHalf[1]) - 1);
        tempDate.setUTCDate(firstHalf[2]);

        tempDate.setUTCHours(secondHalf[0]);
        tempDate.setUTCMinutes(secondHalf[1]);
        tempDate.setUTCSeconds(secondHalf[2]);

        return tempDate;
    }

    let getNextExchangeDayUTC = () => {
        let today = new Date();
        let dateUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));
        for (let i = 0; i < 8; i++) {
            if (exchangeDay - 1 == dateUTC.getDay()) break;
            dateUTC.addDays(1);
        }
        return dateUTC;
    }

    let addNewStyles = () => {
        let style = document.createElement('style');
        style.innerHTML = '.before-exchange { color: #31dd31 !important; } .after-exchange { color: #ff3232 !important;  }';
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    let calculateExchangeColor = () => {
        // Get all visible elements
        const exchangeDayDate = getNextExchangeDayUTC();

        document.querySelectorAll('[id^="clock"]').forEach(plant => {
            let dateString = plant.innerText.substr(extraWords.length);
            let utcDate = parseStringToUtcDate(dateString);
            let isBeforeNextExangeDay = utcDate < exchangeDayDate;
            let selectedClass = isBeforeNextExangeDay ? 'before-exchange' : 'after-exchange';

            plant.classList.add(selectedClass)
        })
    }

    addNewStyles();
    calculateExchangeColor();
})();