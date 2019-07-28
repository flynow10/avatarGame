/*jshint esversion: 6 */
'use strict';
const turnsBetweenWarRange = [2, 4];
const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
});

Vue.component('power', {
    props: ["firePercent", "airPercent", "waterPercent", "earthPercent"],
    methods: {
        format(formatType, num) {
            switch (formatType) {
                case "percent":
                    return parseFloat(num).toFixed(0) + "%";
                case "money":
                    return money.format(num);
            }
        }
    },
    template: '<div class="power"><h3>Power Percentages</h3><h5 class="fire">Fire Nation: {{ format("percent", firePercent) }}</h5><h5 class="water">Water Tribe: {{ format("percent", waterPercent) }}</h5><h5 class="air">Air Nation: {{ format("percent", airPercent) }}</h5><h5 class="earth">Earth Kingdom: {{ format("percent", earthPercent) }}</h5></div>'
});

var game = new Vue({
    el: "#game",
    data: {
        firePercent: 25,
        waterPercent: 25,
        airPercent: 25,
        earthPercent: 25,
        timeTilWar: 0,
        war: false,
    },
    watch: {
        timeTilWar: function(newVal, old) {
            if (newVal === 0 && old !== 0) {
                warHandler.startWar();
            }
        }
    },
    methods: {
        weightedRandom(array = [], weightsArray = []) {
            weightedArray = [];
            for (var i = 0; i < array.length; i++) {
                for (var p = 0; p < weightsArray[i] * 100; p++) {
                    weightedArray.push(array[i]);
                }
            }
            return weightedArray[game.randomGen(0, weightedArray.length - 1)];
        },
        format(formatType, num) {
            switch (formatType) {
                case "percent":
                    return parseFloat(num).toFixed(0) + "%";
                case "money":
                    return money.format(num);
            }
        },
        randomGen(min, max, amount = 1) {
            min = Math.ceil(min);
            max = Math.floor(max);
            if (amount > max - min) {
                amount = max - min;
            }
            if (min === 0 && max === 0) {
                return 0;
            }
            var answerArray = [],
                nextAdd;
            for (let i = 0; i < amount;) {
                nextAdd = Math.floor(Math.random() * (max - min + 1)) + min;
                var hasInArray = answerArray.findIndex(x => {
                    return x === nextAdd;
                });
                if (answerArray.length === 0 || hasInArray === -1) {
                    answerArray.push(nextAdd);
                    i++;
                }
            }
            return (answerArray.length === 1) ? answerArray[0] : answerArray;
        },
        translation(text, lang) {
            var returnString = "",
                suffix = "";
            if (text.search(/fire/gi) > -1) {
                returnString = "fire";
                suffix = "nation";
            } else {
                if (text.search(/water/gi) > -1) {
                    returnString = "water";
                    suffix = "tribe";
                } else {
                    if (text.search(/air/gi) > -1) {
                        returnString = "air";
                        suffix = "nation";
                    } else {
                        if (text.search(/earth/gi) > -1) {
                            returnString = "earth";
                            suffix = "kingdom";
                        } else {
                            return 'unknown nation';
                        }
                    }
                }
            }
            for (var i = 0; i < lang.length; i++) {
                switch (lang[i]) {
                    case "d":
                        returnString = returnString.charAt(0).toUpperCase() + returnString.slice(1);
                        break;
                    case "n":
                        returnString = returnString + " nation";
                        break;
                    case "N":
                        returnString = returnString + " " + suffix;
                        break;
                    case "s":
                        returnString = " " + returnString + " ";
                        break;
                    case "l":
                        returnString = " " + returnString;
                        break;
                    case "r":
                        returnString = returnString + " ";
                        break;
                }
            }
            return returnString;
        },
        playerModal() {
            $("#player").modal({ backdrop: "static", keyboard: false, });
        },
        pickARandomNation(array = []) {
            var pickableNation = ["earth", "water", "fire", "air"];
            for (let i = 0; i < array.length; i++) {
                const element = this.translation(array[i], "");
                var index = pickableNation.indexOf(element);
                pickableNation.splice(index, 1);
            }
            return pickableNation[this.randomGen(0, pickableNation.length - 1)];

        },
    },
    computed: {
        currentPosition() {
            return player.currentPosition;
        },
        locationOfWar() {
            return warHandler.location;
        }
    },
    mounted() {
        setTimeout(() => {
            window.scrollTo(0, document.body.scrollHeight);
        }, 20);
        $("#game-start-modal").modal({
            backdrop: "static",
            keyboard: false,
        });
    },
});
