import { overrideGlobalConsole } from "../utils/logger";

overrideGlobalConsole();

console.log('kai-cd background script loaded.');

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'closeSidePanel') {
        try {
            // Find the tab that sent the message, which should be the new main tab.
            const senderTab = sender.tab;
            if (senderTab?.windowId) {
                // Get all tabs in that window, except the sender
                const tabsInWindow = await chrome.tabs.query({ windowId: senderTab.windowId });
                // We assume the panel was open on the tab that was active *before* the new tab.
                // Since we can't know for sure, the safest bet is to try to close it on all of them.
                // This is generally safe as it will only close if the panel is open.
                for (const tab of tabsInWindow) {
                    if (tab.id && tab.id !== senderTab.id) {
                         await chrome.sidePanel.setOptions({ tabId: tab.id, enabled: false });
                    }
                }
            }
        } catch(e) {
            console.warn('Could not close side panel, API may not be available.', e);
        }
    }
}); 