// ==UserScript==
// @name         Colored tiers to blockfarm maps
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Add colored tiers to the blockarm maps
// @author       jaacu
// @match        https://blockfarm.club/farm/mapview/*
// @icon         https://www.google.com/s2/favicons?domain=blockfarm.club
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let addNewStyles = () => {
        let style = document.createElement('style');
        style.innerHTML = `
            .uncommon-border { border: 4px solid rgb(147, 197, 253) !important; }
            .rare-border { border: 4px solid rgb(249, 168, 212) !important; }
            .epic-border { border: 4px solid rgb(252, 211, 77) !important; }
            .legendary-border { border: 4px solid rgb(217, 119, 6) !important; }
        `;
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    let calculateMapColors = () => {
        // Get all map elements and tiers
        try {
            let buttons = document.getElementsByClassName('table-auto mx-auto')[0].getElementsByTagName('button');
            Array.from(buttons).forEach(button => {
                const buttonTier = button.parentElement.getElementsByTagName('i')[0].innerText.toLowerCase();
                if (buttonTier != 'not unallocated') {
                    button.classList.add(`${buttonTier}-border`);
                }
            })
        } catch {
            console.error('Element not found')
        }
    }

    addNewStyles();
    calculateMapColors();
})();