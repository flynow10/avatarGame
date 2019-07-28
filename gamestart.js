var avatar = new Vue({
    el: "#game-start-modal",
    data: {
        stage: 1,
        name: "The Avatar",
        nation: "",
        allNations: ["firePercent", "waterPercent", "airPercent", "earthPercent"],
        backstories: [{
                beginning: "As a result of the 100 year war, the",
                one: "has become the most powerful nation.",
                two: "The other three nations were severely weakend.",
                three: "It is your job as the avatar to bring peace to the nations.",
                equal: true,
                number: 0,
            },
            {
                beginning: "As a result of the 100 year war, the",
                one: "has become the most powerful nation. The",
                two: "has become severely weakend and the other two nations were weakend but not as much.",
                three: "It is your job as the avatar to bring peace to the nations.",
                equal: false,
                number: 1,
            }
        ],
        power: "",
        weak: "none",
        //weak = 1
        //equal = 2
        weakOrEqual: 0,
        chosenbackstory: 0,
    },
    methods: {
        startRand() {
            var rand = game.randomGen(0, 3),
                currentNation = this.allNations[rand];
            this.allNations.splice(rand, 1);
            this.power = currentNation;
            game.$data[currentNation] = game.randomGen(50, 70);
            var percentLeft = 100 - game.$data[currentNation];
            this.weakOrEqual = game.randomGen(1, 2);
            switch (this.weakOrEqual) {
                case 1:
                    // One nation is severly weakend
                    rand = game.randomGen(0, 2);
                    currentNation = this.allNations[rand];
                    this.allNations.splice(rand, 1);
                    game.$data[currentNation] = Math.round(((percentLeft / 7) * 3) + 1);
                    rand = game.randomGen(0, 1);
                    currentNation = this.allNations[rand];
                    this.allNations.splice(rand, 1);
                    game.$data[currentNation] = Math.round(((percentLeft / 7) * 3) - 1);
                    game.$data[this.allNations[0]] = Math.round((percentLeft / 7));
                    this.weak = this.allNations[0];
                    if (game.firePercent + game.airPercent + game.waterPercent + game.earthPercent !== 100) {
                        var needed = 100 - (game.firePercent + game.airPercent + game.waterPercent + game.earthPercent);
                        game.$data[this.allNations[0]] = game.$data[this.allNations[0]] + needed;
                    }

                    break;
                case 2:
                    //Equal
                    var i = 1
                    this.allNations.forEach(nation => {
                        if (i === 1) {
                            game.$data[nation] = Math.round((percentLeft / 3) + 1);
                        } else {
                            if (i === 3) {
                                game.$data[nation] = Math.round((percentLeft / 3) - 1);
                            } else {
                                game.$data[nation] = Math.round(percentLeft / 3);
                            }
                        }

                        i++
                    });
                    if (game.firePercent + game.airPercent + game.waterPercent + game.earthPercent !== 100) {
                        var needed = 100 - (game.firePercent + game.airPercent + game.waterPercent + game.earthPercent);
                        game.$data[this.allNations[0]] = game.$data[this.allNations[0]] + needed;
                    }
                    break;
            }
            this.allNations = ["firePercent", "waterPercent", "airPercent", "earthPercent"];
            game.timeTilWar = game.randomGen(4,7);
            warHandler.location = this.translation(this.allNations[game.randomGen(0,3)], "");
            this.backstorySetup()
        },
        backstorySetup() {
            player.currentPosition = player.nation;
            player.skill[player.nation].level = 2;
            var p = player.skill;
            p.earth.percent = game.randomGen(10,50);
            p.air.percent = game.randomGen(10,50);
            p.fire.percent = game.randomGen(10,50);
            p.water.percent = game.randomGen(10,50);
            var avalibleBackstories = [];
            this.backstories.forEach(backstory => {
                var tequal = (this.weakOrEqual === 1) ? false : true;
                if(backstory.equal === tequal){
                    avalibleBackstories.push(backstory);
                }
            });
            var highestNum = 0
            avalibleBackstories.forEach(backstory => {
                if(backstory.number >= highestNum){
                    highestNum = backstory.number
                }
            })
            while (true) {
                var backstoryNum = game.randomGen(0, highestNum);
                var avalible = false;
                avalibleBackstories.forEach(backstory => {
                    if(backstoryNum === backstory.number){
                        avalible = true;
                    }
                });
                if(avalible === true){
                    this.chosenbackstory = backstoryNum;
                    break;
                }
            }
        },
        translation(text, lang) {
            var returnString = "",
            suffix = "";
            if(text.search(/fire/gi) > -1){
                returnString = "fire";
                suffix = "nation";
            }else{
                if(text.search(/water/gi) > -1){
                    returnString = "water";
                    suffix = "tribe";
                }else{
                    if(text.search(/air/gi) > -1){
                        returnString = "air";
                        suffix = "nation";
                    }else{
                        if(text.search(/earth/gi) > -1){
                            returnString = "earth";
                            suffix = "kingdom";
                        }else{
                           return 'unknown nation'
                        }
                    }
                }
            }
            for(var i = 0; i < lang.length; i++){
                switch(lang[i]){
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
        }
    },
});