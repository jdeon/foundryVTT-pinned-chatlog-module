export const s_MODULE_ID = 'pinned-chat-message';
export const s_EVENT_NAME = `module.${s_MODULE_ID}`;
export const PINNED_FOR_ALL = 'all'

//CSS
export const CLASS_HARD_HIDE = 'hardHide'
export const CLASS_CHAT_MESSAGE = 'chat-message'
export const CLASS_PINNED_MESSAGE = 'pinned-message'
export const CLASS_PINNED_TAB_MESSAGE = 'pinned-tab-message'

export const ENUM_IS_PINNED_VALUE = {
    none : 0,
    all : 1,
    self : 2
}

/**
 * 
 * @param {*} chatMessage 
 * @returns ENUM_IS_PINNED_VALUE
 */
export function checkIsPinned(chatMessage){
    if(chatMessage.flags?.pinnedChat?.pinned?.includes(game.user.id)){
        return ENUM_IS_PINNED_VALUE.self
    } else if (chatMessage.flags?.pinnedChat?.pinned?.includes(PINNED_FOR_ALL)){
        return ENUM_IS_PINNED_VALUE.all
    } 
    
    return ENUM_IS_PINNED_VALUE.none
}

export function allowToPinMessage(chatMessage){
    return chatMessage.canUserModify(Users.instance.current,'update')
        || game.user.role >= game.settings.get(s_MODULE_ID, "minimalRoleToPinnedOther")
}


/**
 * Add value if it don't exist or remove it
 * @param {T[]} array 
 * @param T} value 
 */
export function toggleArrayValue (array, value) {
    let index = array.indexOf(value);

    if (index === -1) {
        array.push(value);
    } else {
        array.splice(index, 1);
    }
}


let isDoubleClick = false

export function simpleClick(callBack){
    setTimeout(() => {
        if(!isDoubleClick){
            callBack()
        }
}, 500)
}

export function doDoubleCheck(){
    isDoubleClick = true
    setTimeout(() => {
        isDoubleClick = false
    }, 1000)
}