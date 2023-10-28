chrome.runtime.onMessage.addListener(data => {
    console.log(data)
    if (data.type === 'notification') {
        chrome.notifications.create('', data.options)
    }
})
