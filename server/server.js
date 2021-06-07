/// <reference types="@altv/types-server" />
import alt from 'alt-server';

console.log("Siren Control Started");

alt.onClient('sc::syncStage', (player, veh, siren, isPlaying, currentStage, currentSiren) => {
    veh.setStreamSyncedMeta("stageSync", {
        veh:veh,
        siren: siren,
        isPlaying:  isPlaying,
        currentStage:currentStage,
        currentSiren: currentSiren
    })
});

alt.onClient('sc::syncSiren', (player, veh, isPlaying, audioName, id) => {
    veh.setStreamSyncedMeta("sirenSync", {
        veh: veh,
        soundId: id,
        isPlaying:  isPlaying,
        audioName: audioName,
    })
})

