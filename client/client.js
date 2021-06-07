/// <reference types="@altv/types-client" />
/// <reference types="@altv/types-natives" />
import game from 'natives';
import alt, { emit } from "alt-client";
import {config} from "./config.js";


let eventSent = false;

class sirenControl{

    toggleStageUp(){
        let entity = alt.Player.local.vehicle;
        if(entity  && isEmergencyVeh(entity)){
            entity.currentStage += 1
            if (!entity.currentStage) {
                entity.currentStage = 2
            }
            if (entity.currentStage > 3) {
                entity.currentStage = 3
            }
            this.toggleStage(entity, "up")
        }
    }
    toggleStageDown(){
        let entity = alt.Player.local.vehicle;
        if(entity  && isEmergencyVeh(entity)){
            entity.currentStage -= 1
            if (!entity.currentStage) {
                entity.currentStage = 0
            }
            if (entity.currentStage < 0) {
                entity.currentStage = 0
            }
            this.toggleStage(entity, "down")
        }
    }
    toggleStage(entity, stage){
        switch (entity.currentStage) {
            case 1: {
                alt.emitServer('sc::syncSiren', entity, false, '', entity.sirenID)
                alt.emitServer('sc::syncSiren', entity, false, '', entity.auxSirenID)
                if(entity.scanSiren){
                    alt.clearInterval(entity.scanSiren)
                    entity.scanSiren = null 
                }
                alt.emitServer('sc::syncStage', entity, false, false, entity.currentStage, 0)
                break
            }
            case 2: {
                alt.emitServer('sc::syncSiren', entity, false, '', entity.sirenID)
                alt.emitServer('sc::syncSiren', entity, false, '', entity.auxSirenID)
                if(entity.scanSiren){
                    alt.clearInterval(entity.scanSiren)
                    entity.scanSiren = null 
                }
                alt.emitServer('sc::syncStage', entity, true, true, entity.currentStage, 0)
                break
            }
            case 3: {
                alt.emitServer('sc::syncStage', entity, true, true, entity.currentStage, 0)
                break
            }
        }
    }
    toggleTone(tone){
        let entity = alt.Player.local.vehicle;
        if (entity && game.getVehicleClass(entity.scriptID) == 18) {
            if (entity.currentStage >= 3) {
                if (!entity.currentSiren) {
                    entity.currentSiren = 0;
                }
                if (entity.currentSiren === tone) {
                    entity.currentSiren = 0;
                    alt.emitServer('sc::syncSiren', entity, false, '', entity.sirenID);
                    if(entity.scanSiren){
                        alt.clearInterval(entity.scanSiren);
                        entity.scanSiren = null;
                    }
                } else {
                    //TODO handle 5 and 6 siren
                    entity.currentSiren = tone;
                    let tones;
                    if(tone === 5){
                        tones = Object.values(config.sirenTone)
                        tones.splice(4,2);
                    }
                    if (entity.sirenID == null) {
                        let ID = game.getSoundId();
                        entity.sirenID = ID;
                    }
                    alt.emitServer('sc::syncSiren', entity, false, '', entity.sirenID);
                    if(entity.scanSiren){
                        alt.clearInterval(entity.scanSiren);
                        entity.scanSiren = null;
                    }
                    let currentTone = config.sirenTone[tone];
                    if(tone === 5){
                        let random = Math.floor(Math.random() * tones.length)
                        currentTone = config.sirenTone[random];
                    }
                    console.log(entity.currentSiren, "CURRENT")
                    alt.emitServer('sc::syncSiren', entity, true, currentTone, entity.sirenID);
                    if(tone === 5){
                        entity.scanSiren = alt.setInterval(() => {
                            game.stopSound(entity.sirenID);
                            let random = Math.floor(Math.random() * tones.length)
                            alt.emitServer('sc::syncSiren', entity, true, config.sirenTone[random], entity.sirenID)
                        }, 5000)
                    }
                }
            }
        }
    }
    syncVechicleSiren(values){
        if(!values.isPlaying){
            game.stopSound(values.soundId);
        }else{
            game.playSoundFromEntity(values.soundId, values.audioName, values.veh.scriptID, "", true,  0);
        }
    }
    
    syncSirenStage(values){
        game.setVehicleSiren(values.veh.scriptID, values.siren);
        game.setVehicleHasMutedSirens(values.veh.scriptID, true);
        game.isVehicleSirenOn(values.isPlaying);
        values.veh.currentStage = values.currentStage;
        values.veh.currentSiren = values.currentSiren;
    }
}

export const sirenControlHelper = new sirenControl();


alt.everyTick(()=>{
    /**
     * Watch the siren toggle stages
     */
    // Toggle UP Stages
    const pedVeh = alt.Player.local.vehicle;
    if(pedVeh  !== null && isEmergencyVeh(pedVeh) && game.isControlPressed(0, config.stageTogggleKey.up) && !game.isControlPressed(0, config.stageTogggleKey.down)) {
        if(!eventSent){
            sirenControlHelper.toggleStageUp()
            eventSent = true;
            alt.setTimeout(()=>{
                eventSent = false;
            }, 350)
        }
    }
    // Toggle Down Stages
    else if (pedVeh  !== null && isEmergencyVeh(pedVeh) && game.isControlPressed(0, config.stageTogggleKey.up) && game.isControlPressed(0, config.stageTogggleKey.down)) {
        if(!eventSent){
            sirenControlHelper.toggleStageDown()
            eventSent = true;
            alt.setTimeout(()=>{
                eventSent = false;
            }, 350)
        }
    }
})

const isEmergencyVeh =  (veh)=>{
    return  game.getVehicleClass(veh.scriptID) === 18 ?  true : false;
}

alt.on("keydown", (key)=>{
    const pedVeh = alt.Player.local.vehicle;
    if(pedVeh  !== null && isEmergencyVeh(pedVeh)){
        let sirenKeys = config.sirenToggleKey;
        let i = 1;
        for(const keys in sirenKeys){
            sirenKeys[keys] === key && sirenControlHelper.toggleTone(i)
            i++;
        }
    }
})

alt.on("streamSyncedMetaChange", (entity, key, value, oldValue)=>{
    
    if(!entity instanceof alt.Vehicle){
        return;
    }
    if(isEmergencyVeh(entity) && key == "stageSync"){
        sirenControlHelper.syncSirenStage(value);
    }

    if(isEmergencyVeh(entity) && key == "sirenSync"){
        sirenControlHelper.syncVechicleSiren(value);
    }
})
