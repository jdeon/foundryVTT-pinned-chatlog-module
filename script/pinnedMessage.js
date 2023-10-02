import { checkIsPinned, simpleClick, doDoubleCheck, PINNED_FOR_ALL } from './utils.js'

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
    if(pinnedFor === undefined){
        //toggle pinned flag
        pinnedFor = chatMessage.flags?.pinnedChat?.pinned == '' ? PINNED_FOR_ALL : ''
    }

    chatMessage.update({ "flags.pinnedChat.pinned": pinnedFor },{"diff" :true});
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
    pinnedMessage(chatMessage, user.id)
}

function changeIcon(button, pinnedFor){
    let icon = button.find(".fas");

    if(pinnedFor === PINNED_FOR_ALL){
        icon.removeClass('fa-map-pin');
        icon.addClass('fa-circle');
    } else if (typeof pinnedFor === 'string' && pinnedFor !== ''){
        const pinnedUser = game.users.find(user => user.id === pinnedFor)
        if(pinnedUser){
            icon.removeClass('fa-map-pin');
            icon.addClass('fa-circle');
            icon.css("color", pinnedUser.color)
        }
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