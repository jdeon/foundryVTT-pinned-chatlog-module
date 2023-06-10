let currentTab = "default";
let buttonDefault;
let buttonPinned;

function setClassVisibility(cssClass, visible) {
    if (visible) {
        cssClass.removeClass("hardHide");
        cssClass.show();
    } else
        cssClass.hide();
};

//Add new settings
Hooks.once('ready', function () {
    console.log('pinned-chat-message | ready to pinned-chat-message'); 

  game.settings.register("pinned-chat-message", "minimalRoleToPinnedOther", {
    name: "Minimal role to pinned other",
    hint: "Minimal role to pinned chat message from other user",
    default: CONST.USER_ROLES.GAMEMASTER,
    choices: Object.entries(CONST.USER_ROLES).reduce(
        //Generate object of role with id for value
        (accumulator, [label, id]) => {
            const capLabel = label[0].toUpperCase() + label.slice(1).toLowerCase()
            const localizeLabel = game.i18n.localize(`USER.Role${capLabel}`)
            accumulator[id] = localizeLabel; 
            return accumulator
        },
          {}
      ),
    type: String,
    scope: 'world',
    config: true,
    requiresReload: true,
});


})

//Add chatlog type navigation
Hooks.on("renderChatLog", async function (chatLog, html, user) {
    buttonDefault = $(`<a class="item active default" data-tab="default">${game.i18n.localize("TC.TABS.Default")}</a>`);
    buttonDefault.on('click', (event) => selectDefaultTab(chatLog));

    buttonPinned = $(`<a class="item pinned" data-tab="pinned">${game.i18n.localize("TC.TABS.Pinned")}</a>`);
    buttonPinned.on('click', (event) => selectPinnedTab(chatLog));

    let toPrepend = $('<nav class="pinnedchatlog tabs"></nav>');
    toPrepend.append(buttonDefault).append(buttonPinned);
    
    html.prepend(toPrepend);
});

function selectDefaultTab(chatLog){
    currentTab = "default";
    buttonDefault.addClass('active');
    buttonPinned.removeClass('active');

    setClassVisibility($(".chat-message"), true);
    $(".pinned-vue-message").remove();

    chatLog.scrollBottom(true)
};

async function selectPinnedTab(chatLog){
    currentTab = "pinned";
    buttonPinned.addClass('active');
    buttonDefault.removeClass('active');

    setClassVisibility($(".chat-message"), false);

    let pinnedMessages = game.messages.contents.filter(entry => undefined != entry.flags.pinnedChat && entry.flags.pinnedChat.pinned);

    const log = $("#chat-log");
    let htmlMessages = [];
    
    for ( let i=0; i<pinnedMessages.length; i++) {
        let pinnedMessage = pinnedMessages[i];
        if (!pinnedMessage.visible) continue;
        pinnedMessage.logged = true;
        try {
            let messageHtml = await pinnedMessage.getHTML();
            htmlMessages.push(messageHtml);
        } catch (err) {
          err.message = `Pinned message ${pinnedMessage.id} failed to render: ${err})`;
          console.error(err);
        }
      }

      // Prepend the HTML
      log.prepend(htmlMessages);
    
    chatLog.scrollBottom(true)
};

Hooks.on("renderChatMessage", (chatMessage, html, data) => {
    if(chatMessage.canUserModify(Users.instance.current,'update')){
        addButton(html, chatMessage);
    }

    if(chatMessage?.flags?.pinnedChat?.pinned){
        html.addClass("pinned-message")
    }

    if (currentTab == "pinned" && !html.hasClass("pinned-message")) {
        html.hide();
    }
});

function addButton(messageElement, chatMessage) {
    let messageMetadata = messageElement.find(".message-metadata")
    // Can't find it?
    if (messageMetadata.length != 1) {
        return;
    }
    let button = $(`<a> <i class="fas"></i></a>`);//Example of circle fa-circle
    button.on('click', (event) => pinnedMessage(button, chatMessage));
    changeIcon(button, chatMessage.flags?.pinnedChat?.pinned);
    messageMetadata.append(button);
};

function pinnedMessage(button, chatMessage){
    let pinned = chatMessage.flags?.pinnedChat?.pinned;

    pinned = !pinned;

    changeIcon(button, pinned);

    chatMessage.update({ "flags.pinnedChat.pinned": pinned },{"diff" :true});
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

