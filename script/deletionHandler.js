import { PCM_FORCE_DELETE } from "./utils.js"


const PROTECTED_DELETE_DEBOUNCE_MS = 1000;
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

    const dialog = pendingMessages.length === 1 ? singleForceDeleteDialog() : BulkForceDeleteDialog(pendingMessages.length);
    const forceDelete = await dialog;
    
    if (forceDelete) {
        await ChatMessage.deleteDocuments(
            pendingMessages.map(message => message.id),
            { [PCM_FORCE_DELETE]: true }
        );
    }
}

async function singleForceDeleteDialog() {
    return Dialog.confirm({
        title: game.i18n.localize("PCM.deleteProtected.title"),
        content: `<p>${game.i18n.localize("PCM.deleteProtected.content")}</p>`,
        defaultYes: false,
    });
} //TODO: add pinned author to the dialog

async function BulkForceDeleteDialog(protectedCount) {
    return Dialog.confirm({
        title: game.i18n.localize("PCM.deleteProtectedBulk.title"),
        content: `<p>${game.i18n.format("PCM.deleteProtectedBulk.content", { count: protectedCount })}</p>`,
        defaultYes: false,
    });
}