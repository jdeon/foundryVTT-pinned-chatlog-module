import { s_MODULE_ID, PINNED_FOR_ALL } from "./utils.js"


export function addMigrationSettings(){     
    game.settings.register(s_MODULE_ID, "migrationVersion", {
        name: game.i18n.localize("Old version to check migration"),
        hint: game.i18n.localize("Keep it here for migration purpose"),
        scope: "world",
        config: false,
        type: Number,
        default: 1
    });
}

export function migrateModule(){
    if(!game.user.isGM){ return; }

    const oldVersion = game.settings.get(s_MODULE_ID, "migrationVersion")

    switch(true){
        case oldVersion<2 : 
        manageMigrationV2()
        default:
            break
    }

}

function manageMigrationV2 (){
    let nbModif = 0
    
    game.messages.contents.forEach(chatMessage => {
        if(chatMessage.flags?.pinnedChat?.pinned === true){
            chatMessage.update({ "flags.pinnedChat.pinned": PINNED_FOR_ALL },{"diff" :true})
            nbModif++
        } else if (chatMessage.flags?.pinnedChat?.pinned === false){
            chatMessage.update({ "flags.pinnedChat.pinned": '' },{"diff" :true})
            nbModif++
        }
    });

    game.settings.set(s_MODULE_ID, "migrationVersion", 2)
    console.warn(`${s_MODULE_ID} | migrate V2 ${nbModif} pinned flag update`); 
}