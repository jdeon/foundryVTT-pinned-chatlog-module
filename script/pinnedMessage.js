import { toggleArrayValue, simpleClick, doDoubleCheck, s_MODULE_ID, s_EVENT_NAME, PINNED_FOR_ALL } from './utils.js'

export function pinnedMessage(chatMessage, pinnedFor){
    if(chatMessage.canUserModify(Users.instance.current,'update')){
        pinnedMessageUpdate(chatMessage, pinnedFor)
    } else if(game.user.role >= game.settings.get(s_MODULE_ID, "minimalRoleToPinnedOther")){
        pinnedUnownedMessage(chatMessage.id, pinnedFor)
    } else {
        ui.notifications.error(game.i18n.localize('PCM.error.cantPinned'))
    }
};

export function pinnedMessageUpdate(chatMessage, pinnedFor){
    let value

    if(chatMessage.flags?.pinnedChat?.pinned === undefined){
        value = []
    } else {
        value = chatMessage.flags.pinnedChat.pinned
    }

    let needUpdate = true
    if(pinnedFor?.target === undefined){
        //toggle all pinned flag
        toggleArrayValue(value, PINNED_FOR_ALL)
    } else if (pinnedFor.active == undefined){
        //toggle target pinned flag
        toggleArrayValue(value, pinnedFor.target)
    } else if (pinnedFor.active && !value.includes(pinnedFor.target)){
        value.push(pinnedFor.target)
    } else if (!pinnedFor.active && value.indexOf(pinnedFor.target) >= 0){
        let index = value.indexOf(value);
        value.splice(index, 1);
    } else {
        //dont update
        needUpdate = false
    }

    if(needUpdate){
        chatMessage.update({ "flags.pinnedChat.pinned": value },{"diff" :true});
    }
};

export function addPinnedButton(messageHtmlElement, chatMessage) {
    const messageMetadata = messageHtmlElement.querySelector(".message-metadata");

    // Can't find it?
    if (!messageMetadata) return;

    const button = document.createElement("a");
    button.id = `btn-pinned-message-${chatMessage.id}`;

    const icon = document.createElement("i");
    icon.className = "fas";

    button.append(icon);

    button.addEventListener("click", () => pinnedButtonClick(chatMessage));
    button.addEventListener("dblclick", () => pinnedButtonDblClick(chatMessage, game.user));

    changeIcon(button, chatMessage.flags?.pinnedChat?.pinned);

    messageMetadata.append(button);
};

function pinnedButtonClick(chatMessage){
    simpleClick(() => {
        if (game.user.isGM || !game.settings.get(s_MODULE_ID, 'disablePinForAll')){
            pinnedMessage(chatMessage) 
        } else if(!game.settings.get(s_MODULE_ID, 'disableSelfPin')){
            selfPinnedMessage(chatMessage, game.user)
        }
    })
}

function pinnedButtonDblClick(chatMessage, user){
    doDoubleCheck()
    if (game.user.isGM || !game.settings.get(s_MODULE_ID, 'disableSelfPin')){
        selfPinnedMessage(chatMessage, user)
    } else if(!game.settings.get(s_MODULE_ID, 'disablePinForAll')){
        pinnedMessage(chatMessage) 
    }
}

function selfPinnedMessage(chatMessage, user){
    pinnedMessage(chatMessage, {target : user.id})
}

function changeIcon(buttonHtmlElement, pinnedFor) {
    const icon = buttonHtmlElement.querySelector(".fas");
    if (!icon) return;

    if (pinnedFor?.includes(game.user.id)) {
        icon.classList.remove("fa-map-pin");
        icon.classList.add("fa-circle");
        icon.style.color = game.user.color;

    } else if (pinnedFor?.includes(PINNED_FOR_ALL)) {
        icon.classList.remove("fa-map-pin");
        icon.classList.add("fa-circle");
        icon.style.color = "";

    } else {
        icon.classList.add("fa-map-pin");
        icon.classList.remove("fa-circle");
        icon.style.color = "";
    }
}

/***********************************
 * SOKET SETTING
********************************/
function pinnedUnownedMessage(messageId, pinnedFor){
    game.socket.emit(s_EVENT_NAME, {
      type: 'pinnedUnownedMessage',
      payload: {messageId, pinnedFor}
   });
}