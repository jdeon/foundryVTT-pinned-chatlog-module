import { toggleArrayValue, simpleClick, doDoubleCheck, PINNED_FOR_ALL } from './utils.js'

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

export function addPinnedButton(messageElement, chatMessage) {
    let messageMetadata = messageElement.find(".message-metadata")
    // Can't find it?
    if (messageMetadata.length != 1) {
        return;
    }
    let button = $(`<a id='btn-pinned-message-${chatMessage.id}'> <i class="fas"></i></a>`);//Example of circle fa-circle
    button.on('click', () => pinnedButtonClick(chatMessage));
    button.on('dblclick', () => selfPinnedMessage(chatMessage, game.user));
    changeIcon(button, chatMessage.flags?.pinnedChat?.pinned);
    messageMetadata.append(button);
};

function pinnedButtonClick(chatMessage){
    simpleClick(() => pinnedMessage(chatMessage) )
}

function selfPinnedMessage(chatMessage, user){
    doDoubleCheck()
    pinnedMessage(chatMessage, {target : user.id})
}

function changeIcon(button, pinnedFor){
    let icon = button.find(".fas");

    if(pinnedFor?.includes(game.user.id)){
        icon.removeClass('fa-map-pin');
        icon.addClass('fa-circle');
        icon.css("color", game.user.color)
    } else if(pinnedFor?.includes(PINNED_FOR_ALL)){
        icon.removeClass('fa-map-pin');
        icon.addClass('fa-circle');
    } else {
        icon.addClass('fa-map-pin');
        icon.removeClass('fa-circle');
    }
};

/***********************************
 * SOKET SETTING
********************************/
function pinnedUnownedMessage(messageId, pinnedFor){
    game.socket.emit(s_EVENT_NAME, {
      type: 'pinnedUnownedMessage',
      payload: {messageId, pinnedFor}
   });
}