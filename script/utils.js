export const s_MODULE_NAME = 'pinned-chat-message';
export const s_EVENT_NAME = `module.${s_MODULE_NAME}`;
export const PINNED_FOR_ALL = 'all'

//CSS
export const CLASS_HARD_HIDE = 'hardHide'
export const CLASS_CHAT_MESSAGE = 'chat-message'
export const CLASS_PINNED_MESSAGE = 'pinned-message'
export const CLASS_PINNED_TAB_MESSAGE = 'pinned-tab-message'

export function checkIsPinned(chatMessage){
    return chatMessage.flags?.pinnedChat?.pinned === PINNED_FOR_ALL
}