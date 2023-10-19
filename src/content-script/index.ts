let options = {}

async function clickButton(element) {
  try {
    var mouseEvent = document.createEvent("MouseEvents");
    mouseEvent.initEvent("mouseover", true, true);
    element.dispatchEvent(mouseEvent);

    mouseEvent = document.createEvent("MouseEvents")
    mouseEvent.initEvent("mousedown", true, true);
    element.dispatchEvent(mouseEvent);

    mouseEvent = document.createEvent("MouseEvents")
    mouseEvent.initEvent("mouseup", true, true);
    element.dispatchEvent(mouseEvent);

    mouseEvent = document.createEvent("MouseEvents")
    mouseEvent.initEvent("click", true, true)
    element.dispatchEvent(mouseEvent)
  } catch (e) {
    console.error(e)
  }
}

async function decreaseIncreasePrices(idx, decrease, bound = -1) {
  // var priceValue = document.getElementsByClassName("ut-number-input-control")[idx].value;

  var incDecClass = 'increment-value';
  if (decrease) {
    incDecClass = 'decrement-value';
  }
  var decIncButton = document.getElementsByClassName(incDecClass)[idx];
  if (decIncButton.classList.contains("disabled")) {
    return
  }
  await clickButton(decIncButton)
}

async function goBack() {
  var backButton = document.getElementsByClassName("ut-navigation-button-control")[0];
  await clickButton(backButton);

  if (searchWaitInterval) {
    clearInterval(searchWaitInterval);
    searchWaitInterval = null;
  }
}

async function buyNow() {
  var buyButton = document.getElementsByClassName("buyButton")[0];
  if (buyButton.classList.contains("disabled")) {
    return
  }
  await clickButton(buyButton);
  console.log('buy now clicked')

  window.setTimeout(async () => {
    var buyNowStartTime = Date.now();
    while (Date.now() - buyNowStartTime < 3000) {
      var dialog = document.getElementsByClassName('ea-dialog-view-type--message')
      if (dialog.length) {
        var okButton = dialog[0].getElementsByTagName('span')[0];
        await clickButton(okButton);
        console.log('buy now acknowledged')
        break;
      }
    }
  }, options?.buynow?.buynow_delay ?? 0)
  console.log('done')
}

var searchWaitInterval = null;
var searchWaitStart = null;

async function search(instaBuy = false) {
  var searchButton = document.getElementsByClassName("call-to-action")[0];
  await clickButton(searchButton);

  if (searchWaitInterval) {
    clearInterval(searchWaitInterval);
    searchWaitInterval = null;
  }

  if (instaBuy) {
    console.log("instabuy")
    window.setTimeout(async () => {
      console.log('waiting...')
      searchWaitStart = Date.now();
      searchWaitInterval = setInterval(async () => {
        if (Date.now() - searchWaitStart > 10000) {
          clearInterval(searchWaitInterval);
          searchWaitInterval = null;
        }

        var noResults = document.getElementsByClassName("ut-no-results-view");
        if (noResults.length > 0) {
          clearInterval(searchWaitInterval);
          searchWaitInterval = null;
          return
        }

        var buyButtons = document.getElementsByClassName("buyButton");
        if (buyButtons.length > 0) {
          console.log('found')
          clearInterval(searchWaitInterval);
          searchWaitInterval = null;
          await buyNow();
          return
        }
      }, 50)
    }, options?.buynow?.instabuy_delay ?? 3000)
  }
}

async function enterPriceAndListNow() {
  var detailpanel = document.getElementsByClassName("DetailPanel")[0];
  var bidPriceInput = detailpanel.getElementsByClassName("ut-number-input-control")[0];
  var buyNowPriceInput = detailpanel.getElementsByClassName("ut-number-input-control")[1];
  bidPriceInput.value = options?.listitem?.bidprice ?? 500;
  buyNowPriceInput.value = options?.listitem?.buynowprice ?? 10000;
  var listNowButton = detailpanel.getElementsByClassName("call-to-action")[0];
  await clickButton(listNowButton);
}

async function listNow() {
  var detailpanel = document.getElementsByClassName("DetailPanel")[0];
  var listNowButton = detailpanel.getElementsByClassName("call-to-action")[0];
  await clickButton(listNowButton);
}

document.addEventListener("keydown", async (event) => {
  if (document.activeElement.tagName === 'INPUT') {
    return
  }

  switch (event.key) {
    case 'u':
      decreaseIncreasePrices(0, true);
      break;
    case 'i':
      decreaseIncreasePrices(0, false);
      break;
    case 'o':
      decreaseIncreasePrices(1, true);
      break;
    case 'p':
      decreaseIncreasePrices(1, false);
      break;
    case 'z':
      decreaseIncreasePrices(2, true);
      break;
    case 'x':
      decreaseIncreasePrices(2, false);
      break;
    case 'c':
      decreaseIncreasePrices(3, true);
      break;
    case 'v':
      decreaseIncreasePrices(3, false);
      break;
    case 's':
      search(false);
      break;
    case 'q':
      search(true)
      break;
    case 'y':
      goBack();
      break;
    case 'g':
      buyNow();
      break;
    case 'l':
      listNow();
      break;
    case 'k':
      enterPriceAndListNow();
      break;
    default:
      console.log(event);
      break;
  }
})

// load the settings from storage
const loadOptions = async () => {
  const data = await chrome.storage.sync.get('options');
  Object.assign(options, data.options)
}

chrome.runtime.onInstalled.addListener(async (opt) => {
  if (opt.reason === 'install') {
    await loadOptions();
  }
})

// listen for changes to the settings & update the object
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'sync') {
    await loadOptions();
  }
});
