/*jshint esversion: 6 */
var warHandler = new Vue({
    el: "#war",
    data: {
        war: false,
        location: "",
        document: document,
        armiesInvolved: [],
        battleScale: 0,
        chosenBattleStory: 0,
        battleStories: [{
            backstory() {
                return "<h5>A war has broken out between the armies of the <span class='" + warHandler.armiesInvolved[0].name + "'>" + game.translation(warHandler.armiesInvolved[0].name, "dN") + "</span> and the <span class='" + warHandler.armiesInvolved[1].name + "'>" + game.translation(warHandler.armiesInvolved[1].name, "dN") + "</span>. " + ((warHandler.armiesInvolved[1].name === warHandler.location) ? "The <span class='" + warHandler.armiesInvolved[1].name + "'>" + game.translation(warHandler.armiesInvolved[1].name, "dN") + "</span> has the upperhand because of the location of the war, and they don't want the <span class='" + warHandler.armiesInvolved[0].name + "'>" + game.translation(warHandler.armiesInvolved[0].name, "dN") + "</span> taking their land. " : "The <span class='" + warHandler.armiesInvolved[1].name + "'>" + game.translation(warHandler.armiesInvolved[1].name, "dN") + "</span> doesn't like the trading laws that the <span class='" + warHandler.armiesInvolved[0].name + "'>" + game.translation(warHandler.armiesInvolved[0].name, "dN") + "</span> has put on them. ") + "A war has broken out.</h5>";
            }
        }],
        startModalTab: 0,
        bgTab: 1,
        warSolution: "",
        diplomacy: {
            chosenSide: "",
        },
        fight: {
            deployedTroopLocations: [],
            chosenSide: "",
            yourTroops: [{
                    name: "Avatar",
                    amountInStock() {
                        return $(".troop-stack-" + this.name + ' > div').length;
                    },
                    maxStock: 1
                },
                {
                    name: "Bender",
                    amountInStock() {
                        return $(".troop-stack-" + this.name + ' > div').length;
                    },
                    maxStock: 0,
                },
                {
                    name: "Tank",
                    amountInStock() {
                        return $(".troop-stack-" + this.name + ' > div').length;
                    },
                    maxStock: 0,
                }
            ],
            theirTroops: [{
                    name: "Bender",
                    stockNumber: 0,
                    maxStock: 0,
                },
                {
                    name: "Tank",
                    stockNumber: 0,
                    maxStock: 0,
                }
            ],
            draggingName: "",
            draggingStock: 0,
            startedFrom: 0,
            random: 0,
            blockedSquares: [],
            yourTroopSquares: 32,
            theirTroopSquares: 32,
        }
    },
    methods: {
        startWar() {
            this.armiesInvolved = [];
            $(".modal").modal("hide");
            this.war = true;
            game.war = true;
            this.armiesInvolved.push({
                name: game.pickARandomNation([this.location])
            });
            this.battleScale = game.randomGen(0, 2);
            if (game.randomGen(0, 100) <= 5 && this.battleScale !== 2) {
                this.armiesInvolved.push({
                    name: game.pickARandomNation([this.location, this.armiesInvolved[0].name])
                });
            } else {
                this.armiesInvolved.push({
                    name: game.translation(this.location, ""),
                });
            }
            this.chosenBattleStory = game.randomGen(0, this.battleStories.length - 1);

            setTimeout(() => {
                $("#warModal").modal({
                    backdrop: "static",
                    keyboard: false,
                });
            }, 20);
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
        endWar() {
            switch (this.warSolution) {
                case "nothing":
                    $("#warModal").modal("hide");
                    break;
                case "fight":
                    break;
                case "diplomacy":
                    break;
            }
        },
        fightMethod() {
            this.bgTab = 2;
            this.startModalTab = 2;
            if (this.fight.chosenSide !== "") {
                $("#warModal").modal("hide");
                this.fight.blockedSquares.push(...game.randomGen(0, 63, 4));
                this.fight.yourTroopSquares = Math.round(this[this.fight.chosenSide + "Percent"] / 10) + 5;
                this.fight.yourTroops[1].maxStock = Math.round((this.fight.yourTroopSquares / 8) * 5);
                this.fight.yourTroops[2].maxStock = Math.round((this.fight.yourTroopSquares / 8) * 3);
                setTimeout(() => {
                    this.fight.random = game.randomGen(1, 10000);
                }, 50);
                this.fight.theirTroopSquares = Math.round(this[this.armiesInvolved.find(x => x.name !== this.fight.chosenSide).name + "Percent"] / 10) + 5;
                this.fight.theirTroops[0].maxStock = Math.round((this.fight.theirTroopSquares / 8) * 5);
                this.fight.theirTroops[1].maxStock = Math.round((this.fight.theirTroopSquares / 8) * 3);
                this.fight.theirTroops.forEach(element => {
                    element.stockNumber = element.maxStock;
                    this.addEnemy(game.randomGen(0, 31, element.maxStock), element.name);
                });
            }
        },
        diplomacyMethod() {
            this.bgTab = 3;
            this.startModalTab = 2;
            if (this.diplomacy.chosenSide !== "") {
                $("#warModal").modal("hide");

            }
        },
        isLocationValid(n) {
            if (this.fight.blockedSquares.find(x => x === n) >= 0) {
                return false;
            }
            var found = this.fight.deployedTroopLocations.find(x => x.position === n);
            return !found || found.position !== n;
        },
        updateUsedLocation(number) {
            var l = this.fight.deployedTroopLocations;
            var i = l.findIndex(x => x.type === this.fight.draggingName && x.stock === this.fight.draggingStock && x.side === this.fight.chosenSide);
            if (i > -1) {
                l[i].position = number;
            } else {
                l.push({
                    position: number,
                    type: this.fight.draggingName,
                    stock: this.fight.draggingStock,
                    side: this.fight.chosenSide
                });
            }
        },
        addEnemy(location, type = "") {
            var troop = this.fight.theirTroops.find(x => x.name === type);
            switch (typeof location) {
                case "number":
                    if (troop.stockNumber <= 0) {
                        break;
                    }
                    while (!this.isLocationValid(location)) {
                        location++;
                    }
                    this.fight.deployedTroopLocations.push({
                        position: location,
                        type: type,
                        stock: troop.stockNumber,
                        side: this.armiesInvolved.find(x => x.name !== this.fight.chosenSide).name
                    });
                    $(".item-" + location).append("<div class=\"fight-troop " + type + "-troop-" + troop.stockNumber + " " + this.armiesInvolved.find(x => x.name !== this.fight.chosenSide).name + "-bg fight-enemy\"><h5>" + type + "</h5></div>");
                    troop.stockNumber--;
                    break;
                case "object":
                    for (var i = 0; i < location.length;) {
                        var element = location[i];
                        if (troop.stockNumber <= 0) {
                            break;
                        }
                        while (!this.isLocationValid(element)) {
                            element++;
                        }
                        this.fight.deployedTroopLocations.push({
                            position: element,
                            type: type,
                            stock: troop.stockNumber,
                            side: this.armiesInvolved.find(x => x.name !== this.fight.chosenSide).name
                        });
                        $(".item-" + element).append("<div class=\"fight-troop " + type + "-troop-" + troop.stockNumber + " " + this.armiesInvolved.find(x => x.name !== this.fight.chosenSide).name + "-bg fight-enemy\"><h5>" + type + "</h5></div>");
                        troop.stockNumber--;
                        i++;
                    }
                    break;
            }
        },
        startDrag(e, troopName, number) {
            this.fight.startedFrom = parseInt(e.target.parentElement.id);
            this.fight.draggingName = troopName;
            this.fight.draggingStock = number;
        },
        dragover(e) {
            //console.log({over: e});
            e.preventDefault();
        },
        dragenter(e) {
            //console.log({enter: e});
            e.preventDefault();
        },
        drop(number) {
            if (this.isLocationValid(number)) {
                this.updateUsedLocation(number);
                $(".item-" + number).append($(".fight-troop." + this.fight.draggingName + '-troop-' + this.fight.draggingStock + ":not(.fight-enemy)"));
                this.fight.random = game.randomGen(1, 10000);
            }
        },
        confirmTroops() {
            $(".fight-troop:not(.fight-enemy)").prop('draggable', false);
            $(".confirm-troops").remove();
        }
    },
    computed: {
        firePercent() {
            return game.firePercent;
        },
        airPercent() {
            return game.airPercent;
        },
        waterPercent() {
            return game.waterPercent;
        },
        earthPercent() {
            return game.earthPercent;
        },
        playerNation() {
            return player.currentPosition;
        },

    },
});