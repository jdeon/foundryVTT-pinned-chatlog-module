export function pinnedMessage(chatMessage, isPinned){
    if(chatMessage.canUserModify(Users.instance.current,'update')){
        pinnedMessageUpdate(chatMessage, isPinned)
    } else if(game.user.role >= game.settings.get(s_MODULE_NAME, "minimalRoleToPinnedOther")){
        pinnedUnownedMessage(chatMessage.id, isPinned)
    } else {
        ui.notifications.error(game.i18n.localize('PCM.error.cantPinned'))
    }
};

export function pinnedMessageUpdate(chatMessage, isPinned){
    if(isPinned === undefined){
        //toggle pinned flag
        isPinned = ! chatMessage.flags?.pinnedChat?.pinned
    }

    chatMessage.update({ "flags.pinnedChat.pinned": isPinned },{"diff" :true});
};

export function addPinnedButton(messageElement, chatMessage) {
    let messageMetadata = messageElement.find(".message-metadata")
    // Can't find it?
    if (messageMetadata.length != 1) {
        return;
    }
    let button = $(`<a id='btn-pinned-message-${chatMessage.id}'> <i class="fas"></i></a>`);//Example of circle fa-circle
    button.on('click', (event) => pinnedMessage(chatMessage));
    changeIcon(button, chatMessage.flags?.pinnedChat?.pinned);
    messageMetadata.append(button);
};

function changeIcon(button, isPinned){
    let icon = button.find(".fas");

    if(isPinned){
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
function pinnedUnownedMessage(messageId, isPinned){
    game.socket.emit(s_EVENT_NAME, {
      type: 'pinnedUnownedMessage',
      payload: {messageId, isPinned}
   });
  }