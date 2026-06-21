import { PCM_FORCE_DELETE, PINNED_FOR_ALL } from "./utils.js"


const PROTECTED_DELETE_DEBOUNCE_MS = 250;
const pendingProtectedDeletes = new Map();
let pendingProtectedDeleteTimer = null;

export function queueProtectedDeleteConfirmation(chatMessage) {
    pendingProtectedDeletes.set(chatMessage.id, chatMessage);
    scheduleProtectedDeleteDialog();
}

function scheduleProtectedDeleteDialog() {
    clearTimeout(pendingProtectedDeleteTimer);
    pendingProtectedDeleteTimer = setTimeout(processPendingProtectedDeletes, PROTECTED_DELETE_DEBOUNCE_MS);
}

async function processPendingProtectedDeletes() {
    pendingProtectedDeleteTimer = null;
    const pendingMessages = [...pendingProtectedDeletes.values()];
    pendingProtectedDeletes.clear();

    if (pendingMessages.length === 0) return;

    const dialog = pendingMessages.length === 1 ? singleForceDeleteDialog(pendingMessages[0]) : BulkForceDeleteDialog(pendingMessages.length);
    const forceDelete = await dialog;
    
    if (forceDelete) {
        await ChatMessage.deleteDocuments(
            pendingMessages.map(message => message.id),
            { [PCM_FORCE_DELETE]: true }
        );
    }
}

async function singleForceDeleteDialog(chatMessage) {
    const pinnedBy = getPinnedByLabels(chatMessage).join(", ");

    return Dialog.confirm({
        title: game.i18n.localize("PCM.deleteProtected.title"),
        content: `<p>${game.i18n.localize("PCM.deleteProtected.content")}</p>
            <p>${game.i18n.format("PCM.deleteProtected.pinnedBy", { users: pinnedBy })}</p>`,
        defaultYes: false,
    });
}

function getPinnedByLabels(chatMessage) {
    const pinnedUsers = chatMessage.flags?.pinnedChat?.pinned ?? [];

    return pinnedUsers.map(target => {
        if (target === PINNED_FOR_ALL) return game.i18n.localize("PCM.deleteProtected.pinnedForAll");
        return game.users.get(target)?.name ?? target;
    });
}

async function bulkForceDeleteDialog(protectedCount) {
    return Dialog.confirm({
        title: game.i18n.localize("PCM.deleteProtectedBulk.title"),
        content: `<p>${game.i18n.format("PCM.deleteProtectedBulk.content", { count: protectedCount })}</p>`,
        defaultYes: false,
    });
}