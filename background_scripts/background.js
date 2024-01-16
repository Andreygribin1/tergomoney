
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({url: '/panels/index.html'});
});
