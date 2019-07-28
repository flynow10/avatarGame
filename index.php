<?php
// SETUP INCLUDES
require_once("/home/now2006/natewagner.xyz/include/functions.php");

$g_PageTitle = "Games";
$g_ExtraHeadTags = '<link rel="stylesheet" href="styles.css"><link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png" />
<link rel="manifest" href="assets/site.webmanifest" />
<link rel="mask-icon" href="assets/safari-pinned-tab.svg" color="#5bbad5" />
<meta name="msapplication-TileColor" content="#da532c" />
<meta name="theme-color" content="#ffffff" />';
$g_ExtraJSTags = '<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script><script src="war.js"></script><script src="gamestart.js"></script><script src="player.js"></script><script src="main.js"></script>';
$g_AllowAnonymous = true;
require_once("/home/now2006/natewagner.xyz/include/layout.php");
// *****************************

function displayPage(){
?>
<div class="row text-light" id="game" v-if="war === false">
    <div class="col-2"></div>
    <div class="col-8">
        <div class="row">
            <div class="col-3">
                <power :fire-percent="firePercent" :earth-percent="earthPercent" :water-percent="waterPercent"
                    :air-percent="airPercent"></power>
            </div>
            <div class="col-9" v-if="(timeTilWar !== 0)">
                <h4>Next war info</h4>
                <h5>Time until next war: {{timeTilWar}}{{ (timeTilWar !== 1) ? " days" : " day"}}</h5>
                <h5>Location of war:
                    <span :class="translation(locationOfWar, '')">The {{translation(locationOfWar, "dN")}}</span></h5>
            </div>
        </div>
        <div class="mainMap">
            <img src="assets/map.jpg" alt="Map" class="mainImg" />
            <img src="assets/favicon.png" id="avatarIcon" :class="currentPosition" role="button" @click='playerModal' />
        </div>
    </div>
    <div class="col-2"></div>
</div>
<!-----------------WAR------------------>
<div id="war" v-if="war === true">
    <div class="row text-light">
        <div class="col-2"></div>
        <div class="col-8 my-2">
            <div class="row">
                <div class="col-3">
                    <power :fire-percent="firePercent" :earth-percent="earthPercent" :water-percent="waterPercent"
                        :air-percent="airPercent"></power>
                </div>
                <div class="warInfo col-9">
                    <h4>Current war info</h4>
                    <h5>Scale of the war:
                        {{ (battleScale === 0) ? "Minor battle" : (battleScale === 1) ? "Moderate battle": "Major battle" }}
                    </h5>
                    <h5>Armies Involved:
                        <span :class="army.name" v-for="(army,index) in armiesInvolved">{{translation(army.name, "dN")}}{{(index+1 !== armiesInvolved.length)? ", ": ""}}</span>
                    </h5>
                    <h5>Location of War: <span :class="location">{{translation(location, "dN")}}</span></h5>
                </div>
            </div>
            <div class="warBg">
                <!--<img :src="'assets/'+ location +'.png'" alt="Battle Field">-->
                <img src="assets/Battle.png" v-if="bgTab === 1" alt="Battle Field" height="500px">
                <img src="assets/meeting-room.png" v-if="bgTab === 3" alt="meeting-room" height="500px">
                <!--Replace with fight background -->
                <div v-if="bgTab === 2">
                    <div class="war-grid-container d-inline-flex align-content-stretch flex-wrap">
                        <div v-for="(item, index) in Array.from(Array(64).keys())"
                            :class="(fight.blockedSquares.find(x => x === index) >= 0) ? 'bg-dark grid-item item-' + index  : 'grid-item item-' + index"
                            :id="index" @dragover="dragover" @dragenter="dragenter" @drop="drop(index, $event)"></div>
                    </div>
                </div>

                <div class="diplomacy-overlay" v-if="bgTab === 3"></div>
                <!--<div class="fight-overlay" v-if="bgTab === 2"></div>-->

                <div v-if="bgTab === 2" class="fight-yourTroops d-inline-flex align-content-stretch flex-wrap">
                    <div v-for="(troop,index) in fight.yourTroops" v-if="fight.confirmed === false">
                        <div :class="'troop-stack troop-stack-' + troop.name">
                            <div v-for="(dragSquare, troopStock) in Array.from(Array(troop.maxStock).keys())"
                                :class="'fight-troop ' + troop.name + '-troop-' + troopStock +' '+ fight.chosenSide + '-bg'"
                                draggable="true" @dragstart="startDrag($event, troop.name, troopStock);" @click="selectTroop(troop,troopStock)">
                                <h5>{{troop.name}}</h5>
                            </div>
                            <h4 :key="fight.random"  v-if="troop.amountInStock() !== 0">{{troop.amountInStock()}}</h4>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-success btn-large confirm-troops d-inline" v-if="fight.deployedTroopLocations.length !== fight.theirTroops[0].maxStock + fight.theirTroops[1].maxStock" @click="confirmTroops">Confirm
                            Troop Placement</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-2"></div>
    </div>
    <!--------------War Modal--------------->

    <div class="modal fade" id="warModal" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content bg-dark text-light">
                <div class="modal-header">
                    <h5 class="modal-title">War Backstory</h5>
                </div>
                <div class="modal-body">
                    <div v-html="battleStories[chosenBattleStory].backstory()" v-if="startModalTab === 0">
                    </div>
                    <div v-else-if="startModalTab === 1">
                        <h3>What would you like to do about the war?</h3>
                        <button class="btn btn-primary btn-large btn-block" v-if="playerNation === location"
                            @click="warSolution= 'fight';fightMethod();">Fight?</button>
                        <button class="btn btn-primary btn-large btn-block"
                            @click="warSolution= 'diplomacy';diplomacyMethod();">Diplomacy? (Talk it out)</button>
                        <button class="btn btn-primary btn-large btn-block" @click="warSolution= 'nothing';endWar();">Do
                            nothing</button>
                    </div>
                    <div v-else-if="startModalTab === 2">
                        <h3>Who would you like to side with</h3>
                        <button class="btn btn-primary btn-large btn-block"
                            @click="(warSolution === 'fight') ? fight.chosenSide = armiesInvolved[0].name : diplomacy.chosenSide = armiesInvolved[0].name; (warSolution === 'fight') ? fightMethod() : diplomacyMethod();">The
                            {{translation(armiesInvolved[0].name, "dN")}}</button>
                        <button class="btn btn-primary btn-large btn-block"
                            @click="(warSolution === 'fight') ? fight.chosenSide = armiesInvolved[1].name : diplomacy.chosenSide = armiesInvolved[1].name; (warSolution === 'fight') ? fightMethod() : diplomacyMethod();">The
                            {{translation(armiesInvolved[1].name, "dN")}}</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button v-if="startModalTab === 0" @click="startModalTab++;" class="btn btn-primary">Next</button>
                </div>
            </div>
        </div>
    </div>
    <!--Army general/Side helper-->
    <div class="side-helper">

    </div>
</div>
<!---------------MODALS----------------->



<!------------Player Modal-------------->
<div class="modal player-stats fade" tabindex="-1" role="dialog" id="player">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content bg-dark text-light">
            <div class="modal-header">
                <h5 class="modal-title">Player Stats and Actions</h5>
            </div>
            <div class="modal-body">
                <div class="stats tab" v-if="tab === 0">
                    <h3>Stats</h3>
                    <h5 :class="currentPosition">You are in the
                        {{(currentPosition !== 'ocean')? translation(currentPosition, "dN") : "Ocean"}}</h5>
                    <h4>Skill</h4>
                    <h5 class="fireSkill fire">You are a{{(skill.fire.level === 1 || skill.fire.level === 2) ? "n": ""}}
                        {{skill.levels[skill.fire.level]}} firebender and {{format("percent",skill.fire.percent)}}
                        through your rank</h5>
                    <h5 class="waterSkill water">You are
                        a{{(skill.water.level === 1 || skill.water.level === 2) ? "n": ""}}
                        {{skill.levels[skill.water.level]}} waterbender and {{format("percent",skill.water.percent)}}
                        through your rank</h5>
                    <h5 class="airSkill air">You are a{{(skill.air.level === 1 || skill.air.level === 2) ? "n": ""}}
                        {{skill.levels[skill.air.level]}} airbender and {{format("percent",skill.air.percent)}} through
                        your rank</h5>
                    <h5 class="earthSkill earth">You are
                        a{{(skill.earth.level === 1 || skill.earth.level === 2) ? "n": ""}}
                        {{skill.levels[skill.earth.level]}} earthbender and {{format("percent",skill.earth.percent)}}
                        through your rank</h5>
                </div>
                <div class="actions tab" v-else-if="tab === 1">
                    <h3>Actions</h3>
                    <div class="container-fluid">
                        <div class="action-row row" v-for="i in Math.ceil(actions.length/2)">
                            <div class="action col-6 my-1 mx-0" v-for="action in actions.slice((i - 1) * 2, i * 2)">
                                <button :class="(action.cost > timeTilWar) ? 'disabled': ''"
                                    :disabled="(action.cost > timeTilWar) ? true: false"
                                    class="btn btn-dark btn-block btn-large"
                                    @click="if(ss(action.cost,action.s)){action.run();}"><span v-html="action.name()"></span><br>Takes
                                    you {{action.cost}} days to complete</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab" v-else-if="tab === 'move'">
                    <button class="btn btn-primary btn-lg btn-block" v-if="currentPosition !== 'fire'"
                        @click="actions[1].nation = 'fire'; tab = 1; actions[1].run2();">Fire Nation</button>
                    <button class="btn btn-primary btn-lg btn-block" v-if="currentPosition !== 'water'"
                        @click="actions[1].nation = 'water'; tab = 1; actions[1].run2();">Water Tribe</button>
                    <button class="btn btn-primary btn-lg btn-block" v-if="currentPosition !== 'air'"
                        @click="actions[1].nation = 'air'; tab = 1; actions[1].run2();">Air Nomads</button>
                    <button class="btn btn-primary btn-lg btn-block" v-if="currentPosition !== 'earth'"
                        @click="actions[1].nation = 'earth'; tab = 1; actions[1].run2();">Earth Kingdom</button>
                </div>
                <div class="modal-footer">
                    <button v-if="tab === 0" @click="tab = 1" class="btn btn-primary mx-1">Actions ►</button>
                    <button v-if="tab === 1" @click="tab = 0" class="btn btn-primary mx-1">◄ Stats</button>
                    <button v-if="tab === 'move'" @click="tab = 0" class="btn btn-primary mx-1">Cancel</button>
                    <button class="btn btn-primary mx-1" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</div>
<!----------Game Setup Modal------------>
<div class="modal game-start fade" tabindex="-1" role="dialog" id="game-start-modal">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content bg-dark text-light">
            <div class="modal-header">
                <h5 v-if="stage <= 3" class="modal-title">Game Setup</h5>
                <h5 v-else class="modal-title">Backstory</h5>
            </div>
            <div class="modal-body text-center">
                <div v-if="stage === 1">
                    <p>You are a young avatar who has not completed your training in the four elements, Fire, Water,
                        Air, and Earth</p>
                    <a target="_blank"
                        href="https://en.wikipedia.org/wiki/Avatar:_The_Last_Airbender#Series_overview">Don't have any
                        clue what avatar is? Click Here!</a><br>
                    <div class="modal-footer">
                        <button class="btn btn-primary" @click="stage++;">Next</button>
                    </div>
                </div>
                <div v-else-if="stage === 2">
                    <h5>What is your avatar name?</h5>
                    <input type="text" class="form-control" @keyup.enter="if(name !== ''){stage++;}" v-model="name">
                    <div class="modal-footer">
                        <button class="btn btn-primary mt-1" @click="if(name !== ''){stage++;}">Next</button>
                    </div>
                </div>
                <div v-else-if="stage === 3">
                    <h5>What nation would you like to be from?</h5>
                    <div class="row">
                        <button class="btn btn-primary btn-lg btn-block"
                            @click="stage++; nation = 'fire'; startRand();">Fire Nation</button>
                        <button class="btn btn-primary btn-lg btn-block"
                            @click="stage++; nation = 'water'; startRand();">Water Tribe</button>
                        <button class="btn btn-primary btn-lg btn-block"
                            @click="stage++; nation = 'air'; startRand();">Air Nomads</button>
                        <button class="btn btn-primary btn-lg btn-block"
                            @click="stage++; nation = 'earth'; startRand();">Earth Kingdom</button>
                    </div>
                </div>
                <div id="backstory" v-else-if="stage === 4">
                    <h5>{{backstories[chosenbackstory].beginning }}<span :class="translation(power, '')">{{translation(power, "dNs")}}</span>{{ backstories[chosenbackstory].one }}
                        <span :class='(weak !== "none") ? translation(weak, ""): " "'>{{(weak !== "none") ? translation(weak, "dNs"): " "}}</span>
                        {{ backstories[chosenbackstory].two + " " + backstories[chosenbackstory].three}}</h5>
                    <br>
                    <h4>Try clicking on your player marker to view your player stats</h4>
                    <div class="modal-footer">
                        <button class="btn btn-primary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php }?>