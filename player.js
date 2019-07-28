/*jshint esversion: 6 */
var player = new Vue({
    el: "#player",
    data: {
        currentPosition: "",
        skill: {
            levels: ["Beginner", "Intermediate", "Advanced", "Master"],
            earth:{
                level: 0,
                percent: 0,
            },
            fire:{
                level: 0,
                percent: 0,
            },
            water:{
                level: 0,
                percent: 0,
            },
            air:{
                level: 0,
                percent: 0,
            },
        },
        tab: 0,
        actions: [
            {
                run(){
                    $("#player").modal("hide");
                    var random = game.randomGen(20,35);
                    var skill = player.skill[player.currentPosition];
                    if(skill.percent + random < 100){
                        skill.percent += random;
                        alertBox("Your skill in" + player.translation(player.currentPosition, "s") + "bending has increased by " + random + "%. You are now " + skill.percent + "% through your rank", "warning");
                    } else {
                        if(skill.percent + random >= 100){
                            if(skill.level !== 3){
                                skill.percent += random;
                                skill.percent -= 100;
                                skill.level ++;
                                alertBox("Your skill in" + player.translation(player.currentPosition, "s") + "bending has increased by " + random + "%, leveling you up. You are now " + skill.percent + "% through your new rank", "warning");        
                            } else {
                                if(skill.percent !== 100){
                                    skill.percent = 100;
                                    alertBox("You are now a master in the element of" + player.translation(player.currentPosition, "l"), "warning");
                                } else {
                                    alertBox("You are already a master in element " + player.translation(player.currentPosition, "l"), "warning");
                                    game.timeTilWar += this.cost;
                                }
                            }
                        }
                    }
                },
                name(){
                    return "Train in the element of <span class='"+player.translation(player.currentPosition, "")+"'>" + player.translation(player.currentPosition, "d") + "</span>";
                },
                cost: 2,
                s: false,
            },
            {
                name(){
                    return "Move to another nation";
                },
                run(){
                    player.tab = "move";
                },
                run2(){
                    $("#player").modal('hide');
                    var interval2 = setInterval(() => {
						$(':button').prop('disabled', true);
					}, 10);
                    var interval = setInterval(() => {
                        game.timeTilWar -= 1;
                    }, 1000);
                    player.change(this.nation);
                    setTimeout(() => {
                        clearInterval(interval);
						clearInterval(interval2);
                        $(':button').prop('disabled', false);
                    }, 3500);
                },
                cost: 3,
                s: true,
                nation: ""
            },
            {
                name(){
                    return "Wait in the <span class='"+player.translation(player.currentPosition, "")+"'>"+player.translation(player.currentPosition, "dN")+"</span>";
                },
                run(){
                    $("#player").modal('hide');
                    alertBox("You waited a day", "warning");
                },
                cost: 1,
                s: false,
            }
        ],
        ss(cost, special){
            if(game.timeTilWar >= cost){
                if(special === false){
                    game.timeTilWar -= cost;
                }
                return true;
            } else {
                return false;
            }
        }
    },
    methods: {
        action(){

        },
        format(formatType, num) {
            switch (formatType) {
                case "percent":
                    return parseFloat(num).toFixed(0) + "%";
                case "money":
                    return money.format(num);

            }
        },
        change(to) {
            var nation;
            switch (to) {
                case "water":
                    nation = {display : "initial",top: "12%",left: "48%",borderColor: "#68aff5"};
                    break;
                case "earth":
                    nation = {display : "initial",top: "47%",left: "60%",borderColor: "#1cc226"};
                    break;
                case "air":
                    nation = {display : "initial",top: "68%",left: "43%",borderColor: "#f5c168"};
                    break;
                case "fire":
                    nation = {display : "initial",top: "46%",left: "24%",borderColor: "#e70004"};
                    break;
            }
            $("#avatarIcon").css(nation);
            this.currentPosition = "ocean";
            setTimeout(() => {
                this.currentPosition = to;
            }, 3000);
        },
        multiplyByI(index, i) {
            return index*i;
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
                           return 'unknown nation';
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
        },
    },
    computed: {
        name(){
            return avatar.name;
        },
        nation(){
            return avatar.nation;
        },
        timeTilWar(){
            return game.timeTilWar;
        }
    },

});