// ==UserScript==
// @name         Blockfarm land improvements
// @namespace    http://tampermonkey.net/
// @version      1.0.2
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
    let plantsDates = [];

    const loadExternalScripts = () => {
        // Load external scripts
        let scriptElement = document.createElement('script');
        scriptElement.setAttribute('src', "https://cdn.jsdelivr.net/gh/nwcell/ics.js/ics.deps.min.js");
        document.head.appendChild(scriptElement);
    }

    const generateICSFile = () => {
        if (plantsDates.length == 0) {
            alert('No harvest events detected.');
            return;
        }
        var cal = ics();
        plantsDates.forEach((date, index) => {
            let eventName = `Harvest plant ${index + 1}`
            let startDate = date.toString();
            cal.addEvent(eventName, 'You can harvest a plant now', 'Blockfarm', startDate, startDate);
        })
        cal.download()
    }

    const addMenuButton = () => {
        let floatingButton = document.createElement('div');
        floatingButton.innerText = 'Generate harvest events';
        floatingButton.classList.add('floating-button')
        floatingButton.addEventListener('click', generateICSFile);
        document.body.appendChild(floatingButton);
    }

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
        style.innerHTML = `
            .before-exchange { color: #31dd31 !important; }
            .after-exchange { color: #ff3232 !important;  }
            .floating-button {
                background-color: #4CAF50;
                border: none;
                color: white;
                padding: 10px 5px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 4px 2px;
                cursor: pointer;
                -webkit-transition-duration: 0.4s; 
                transition-duration: 0.4s;
                position: fixed;
                z-index: 999999;
                top: 85%;
                right: 2%;
                max-width: 125px;
                box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
                border-radius: 20px;
            }
            .floating-button:hover {
                box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24),0 17px 50px 0 rgba(0,0,0,0.19);
            }
        `;
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

            plantsDates.push(utcDate);

            plant.classList.add(selectedClass)
        })
    }

    loadExternalScripts();
    addNewStyles();
    calculateExchangeColor();
    addMenuButton();
})();