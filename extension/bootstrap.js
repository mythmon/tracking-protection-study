Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/Preferences.jsm")
Components.utils.import("resource://gre/modules/PopupNotifications.jsm");

const UI_AVAILABLE_NOTIFICATION = "sessionstore-windows-restored";
const TRACKING_PROTECTION_PREF = "privacy.trackingprotection.enabled";
const DOORHANGER_ID = "onboarding-trackingprotection-confirmation";
const DOORHANGER_MESSAGE = "Tracking protection is enabled.";
const NEW_TAB_URL = "about:mozilla";

/**
 * Open doorhanger-style notification on desired chrome window.
 *
 * @param {ChromeWindow} win
 */
function openDoorhanger(win) {
  const doorhanger = new PopupNotifications(win.gBrowser,
    win.document.getElementById("notification-popup"),
    win.document.getElementById("notification-popup-box"));

  const options = {
    displayURI: "test123",
    persistent: true,
    hideClose: true,
  };

  const action = {
    label: "Got it!",
    accessKey: "G",
    callback: () => {},
  };
  doorhanger.show(win.gBrowser.selectedBrowser, DOORHANGER_ID, DOORHANGER_MESSAGE,
    null, action, [], options);

  const prefs = new Preferences({ defaultBranch: true });
  prefs.set(TRACKING_PROTECTION_PREF, true);
}

/**
 * Open URL in new tab on desired chrome window.
 *
 * @param {ChromeWindow} win
 * @param {URL} url
 * @param {bool} foreground - true if this tab should open in the foreground.
 */
function openURL(win, url, foreground = true) {
  const tab = win.gBrowser.addTab(url);
  if (foreground) {
    const newWin = win;
    newWin.gBrowser.selectedTab = tab;
  }
}

this.startup = function() {
  let win = Services.wm.getMostRecentWindow("navigator:browser");
  if (win.gBrowser) {
    openURL(win, NEW_TAB_URL);
    openDoorhanger(win);
  } else {
    const observer = {
      observe: (subject, topic, data) => {
        Services.obs.removeObserver(observer, UI_AVAILABLE_NOTIFICATION);

        win = Services.wm.getMostRecentWindow("navigator:browser");
        openURL(win, NEW_TAB_URL);
        openDoorhanger(win);
      },
    };
    Services.obs.addObserver(observer, UI_AVAILABLE_NOTIFICATION);
  }
};

this.shutdown = function() {};
this.install = function() {};
this.uninstall = function() {};