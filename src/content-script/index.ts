import {storage} from '@/storage'
import {abort} from 'process';

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
    return -1
  }

  return 1
}

enum LoopSteps {
  NONE,
  SEARCH,
  CHECK_RESULTS,
  BUY,
  ACKNOWLEDGE,
  TRANSMIT,
  GO_BACK,
  FILTER,
}

const defaultLoopState = {
  steps: [] as LoopSteps[],
  stepIdx: 0,
  looping: false,
  errors: 0,
  done: false,
  maxStepDuration: 5000,
  sameStepCount: 0,
}
const LOOP_MAX_ERRORS = 1
let loopState = defaultLoopState
let loopIntervalId = null

const xSearch = async () => {
  var searchButton = document.getElementsByClassName("call-to-action");
  if (searchButton.length < 1) {
    return -1
  }
  return await clickButton(searchButton[0]);
}

const xCheckResults = async () => {
  var noResults = document.getElementsByClassName('ut-no-results-view')
  if (noResults.length) {
    return 2
  }

  var buyButton = document.getElementsByClassName("buyButton")
  if (buyButton.length < 1) {
    return 0
  }

  return 1
}

const xBuyNow = async () => {
  var buyButton = document.getElementsByClassName("buyButton")
  if (buyButton.length < 1) {
    return 0
  }
  if (buyButton[0].classList.contains("disabled")) {
    return -1
  }

  return await clickButton(buyButton[0]);
}

const xAcknowledge = async () => {
  var dialog = document.getElementsByClassName('ea-dialog-view-type--message')
  if (dialog.length) {
    var okButton = dialog[0].getElementsByTagName('span')[0];
    return await clickButton(okButton);
  }
  return 0
}

const xTransmit = async () => {
  let notificationLayer = document.getElementById('NotificationLayer')
  // "Notification negative"
  if (notificationLayer) {
    let notifications = notificationLayer.getElementsByClassName('Notification negative')
    if (notifications.length) {
      return -1
    }
  }

  let auctionInfo = document.getElementsByClassName("auctionInfo")
  if (auctionInfo.length) {
    let subHeading = document.getElementsByClassName("subHeading")
    if (subHeading.length && subHeading[0].textContent?.includes("Congratulations")) {
      return 1
    }
  }

  return 0
}


const runLoop = async () => {
  let result = 0
  loopState.sameStepCount++

  switch (loopState.steps[loopState.stepIdx]) {
    case LoopSteps.SEARCH:
      result = await xSearch()
      console.log('Search', result)
      if (result === -1) {
        loopState.errors += 1
      }
      if (result === 1) {
        loopState.stepIdx++
        loopState.sameStepCount = 0
      }
      break

    case LoopSteps.CHECK_RESULTS:
      result = await xCheckResults()
      console.log('Check Results', result)
      if (result === -1) {
        loopState.errors += 1
      }
      if (result === 1) {
        loopState.stepIdx++
        loopState.sameStepCount = 0
      }
      if (result === 2) {
        loopState.errors += 1
      }
      break

    case LoopSteps.BUY:
      result = await xBuyNow()
      console.log('Buy', result)
      if (result === -1) {
        loopState.errors += 1
      }
      if (result === 1) {
        loopState.stepIdx++
        loopState.sameStepCount = 0
      }
      break

    case LoopSteps.ACKNOWLEDGE:
      result = await xAcknowledge()
      console.log('Acknowledge', result)
      if (result === -1) {
        loopState.errors += 1
      }
      if (result === 1) {
        loopState.stepIdx++
        loopState.sameStepCount = 0
      }
      break
    case LoopSteps.TRANSMIT:
      result = await xTransmit()
      console.log('Transmit', result)
      if (result === -1) {
        loopState.errors += 1
      }
      if (result === 1) {
        loopState.stepIdx++
        loopState.sameStepCount = 0
      }
      break
  }

  if (loopState.stepIdx >= loopState.steps.length) {
    if (loopState.looping) {
      loopState.stepIdx = 0
    } else {
      abortLoop()
    }
  }

  if (loopState.errors >= LOOP_MAX_ERRORS) {
    console.log('Too many errors, stopping')
    abortLoop()
  }

  let loop_interval = options?.general?.loop_interval ?? 1000
  if ((loopState.sameStepCount * loop_interval) > loopState.maxStepDuration) {
    console.log('Step taking too long, stopping')
    abortLoop()
  }
}

const startLoop = (steps) => {
  loopState = JSON.parse(JSON.stringify(defaultLoopState))
  loopState.steps = steps

  loopIntervalId = setInterval(async () => {
    await runLoop()
  }, options?.general?.loop_interval ?? 1000)
}

const stopLooping = () => {
  loopState.looping = false
}

const abortLoop = () => {
  loopState.done = true
  clearInterval(loopIntervalId)
  loopIntervalId = null
}

const searchAndBuyNowLoop = () => {
  startLoop([LoopSteps.SEARCH, LoopSteps.CHECK_RESULTS, LoopSteps.BUY, LoopSteps.ACKNOWLEDGE, LoopSteps.TRANSMIT])
}

const buyNowLoop = () => {
  startLoop([LoopSteps.BUY, LoopSteps.ACKNOWLEDGE, LoopSteps.TRANSMIT])
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
  abortLoop()

  var backButton = document.getElementsByClassName("ut-navigation-button-control")[0];
  await clickButton(backButton);
}

async function search() {
  let result = await xSearch()

  if (result === -1) {
    console.log('search failed')
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
      search();
      break;
    case 'q':
      searchAndBuyNowLoop();
      break;
    case 'y':
      goBack();
      break;
    case 'g':
      buyNowLoop();
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
  const data = await storage.get();
  Object.assign(options, data)
  console.log('loaded options', options)
}
loadOptions()

// listen for changes to the settings & update the object
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'sync') {
    await loadOptions();
  }
});
