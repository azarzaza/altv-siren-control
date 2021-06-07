export const config = {
    stageTogggleKey : {
        up: 37, // [0, 37 ] is TAB. key should be game control keys not a keycodes ref: https://wiki.rage.mp/index.php?title=Controls
        down: 36 // down works with multipe key press so mention the second keys to toggle down eg: CTRL + TAB
    },
    sirenTone : {
        1: 'VEHICLES_HORNS_SIREN_1', //  Tone 1
        2: 'VEHICLES_HORNS_SIREN_2', //  Tone 2
        3: 'VEHICLES_HORNS_POLICE_WARNING', //  Tone 3
        4: 'VEHICLES_HORNS_AMBULANCE_WARNING', //  Tone 4
        5: 'VEHICLES_HORNS_SIREN_1', // Auxiliary Siren
        // 6: 'SIRENS_AIRHORN' // Horn
    },
    sirenToggleKey : {
        Tone1: 49, // Siren tone 1
        Tone2: 50, // Siren tone 2
        Tone3: 51, // Siren tone 3
        Tone4: 52, // Siren tone 4
        Tone5: 53, // Random siren tone every 5 seconds
        // Tone6: 54, // Auxiliary siren (tone 1)
    }
}