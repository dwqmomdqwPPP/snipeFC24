import {storage} from '@/storage'
import {stats, defaultStats} from '@/stats'

let options = {}
let lastSnipingState = false

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
  ADJUST_FILTER,
  WAIT,
  EXIT,
  FINISH_SUCCESS,
  LIST_ITEM,
}
const LOOP_STEP_NAMES = [
  'NONE',
  'SEARCH',
  'CHECK_RESULTS',
  'BUY',
  'ACKNOWLEDGE',
  'TRANSMIT',
  'GO_BACK',
  'FILTER',
  'ADJUST_FILTER',
  'WAIT',
  'EXIT',
  'FINISH_SUCCESS',
  'LIST_ITEM',
]

const defaultLoopState = {
  steps: [] as LoopSteps[],
  decisions: {},
  stepIdx: 0,
  looping: false,
  errors: 0,
  done: false,
  filterDirectionDown: false,
  maxStepDuration: 5000,
  sameStepCount: 0,
  currentWaitTime: -1,
  snipedCards: 0,
}
const LOOP_MAX_ERRORS = 1
let loopState = defaultLoopState
let loopIntervalId = null

const xSearch = async () => {
  var searchButton = document.getElementsByClassName("call-to-action");
  if (searchButton.length < 1) {
    return -1
  }

  statsAddSearch()
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

  // search results are available
  if (options?.general?.select_card === 1) {
    let auctionData = document.getElementsByClassName("listFUTItem has-auction-data")
    if (auctionData.length > 0) {
      let items = auctionData.length
      await clickButton(auctionData[items - 1])
    }
  } else if (options?.general?.select_card === 2) {
    let auctionData = document.getElementsByClassName("listFUTItem has-auction-data")
    let prices = []
    for (let i = 0; i < auctionData.length; i++) {
      let auction = auctionData[i].getElementsByClassName("currency-coins value")
      if (auction.length < 1) {
        continue
      }
      let price = Number(auction[auction.length - 1].textContent?.replaceAll(',', ''))
      // console.log(price)
      prices.push(price)
    }
    let minPrice = Math.min(...prices)
    let minIdx = prices.indexOf(minPrice)
    // console.log(prices, minPrice, minIdx)

    if (minIdx > 0) {
      await clickButton(auctionData[minIdx])
    }
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

  let auctionInfo = document.querySelector(".auctionInfo")
  if (auctionInfo) {
    let subHeading = auctionInfo.querySelector(".subHeading")
    if (subHeading && subHeading.textContent?.includes("Congratulations")) {
      let coinsSpent = Number(auctionInfo.querySelector('.currency-coins')?.textContent?.replaceAll(',', ''))
      loopState.snipedCards++
      console.log('coins spent', coinsSpent)

      await statsAddSniped(coinsSpent)

      return 1
    }
  }

  return 0
}

const xGoBack = async (step) => {
  if (step === 1) {
    // console.log('button clicked')
    var backButton = document.getElementsByClassName("ut-navigation-button-control")[0];
    let res = await clickButton(backButton);
    if (res < 0) {
      return -1
    }
  }

  if (step > 5) {
    return 1
  }

  return 0
}

const xAdjustFilter = async (up: boolean, min: number, max: number) => {
  var priceValue = Number(document.getElementsByClassName("ut-number-input-control")[0].value.replaceAll(',', ''));

  if (!priceValue || priceValue <= min) {
    up = true
  }
  if (priceValue >= max) {
    up = false
  }

  var incDecClass = 'increment-value';
  if (!up) {
    incDecClass = 'decrement-value';
  }
  var decIncButton = document.getElementsByClassName(incDecClass)[0];
  if (decIncButton.classList.contains("disabled")) {
    return [-1, up]
  }
  return [await clickButton(decIncButton), up]
}

const xListItem = async () => {
  var detailpanel = document.querySelector(".DetailPanel");
  if (!detailpanel) {
    console.log('no detailpanel')
    return -1
  }

  var inputs = detailpanel.querySelectorAll(".ut-number-input-control") as NodeListOf<HTMLInputElement>;
  if (inputs.length < 2) {
    console.log('no inputs')
    return -1
  }

  var bidPriceInput = inputs[0];
  var buyNowPriceInput = inputs[1];
  bidPriceInput.value = options?.listitem?.bidprice ?? 500;
  buyNowPriceInput.value = options?.listitem?.buynowprice ?? 10000;

  var listNowButton = detailpanel.querySelector(".call-to-action");
  if (!listNowButton) {
    console.log('no listnow button')
    return -1
  }
  return await clickButton(listNowButton);
}


const xWait = async (step, waitTime) => {
  let currentTime = step * options?.general?.loop_interval ?? 1000
  if (currentTime >= waitTime) {
    return 1
  }

  return 0
}

const runLoop = async () => {
  if (loopState.done) {
    clearInterval(loopIntervalId)
    return
  }

  let currentStep = loopState.steps[loopState.stepIdx]
  let result = 0
  loopState.sameStepCount++

  switch (currentStep) {
    case LoopSteps.SEARCH:
      result = await xSearch()
      break

    case LoopSteps.CHECK_RESULTS:
      result = await xCheckResults()
      break

    case LoopSteps.BUY:
      result = await xBuyNow()
      break

    case LoopSteps.ACKNOWLEDGE:
      result = await xAcknowledge()
      break

    case LoopSteps.TRANSMIT:
      result = await xTransmit()
      break

    case LoopSteps.GO_BACK:
      result = await xGoBack(loopState.sameStepCount)
      break

    case LoopSteps.ADJUST_FILTER:
      [result, loopState.filterDirectionDown] = await xAdjustFilter(loopState.filterDirectionDown, options?.autosniping?.bidlow ?? 150, options?.autosniping?.bidhigh ?? 850)
      break

    case LoopSteps.LIST_ITEM:
      result = await xListItem()
      break

    case LoopSteps.WAIT:
      if (loopState.currentWaitTime < 0) {
        loopState.currentWaitTime = Math.floor(
          Math.random() * (
            options?.autosniping?.wait2 ?? 1000 - options?.autosniping?.wait1 ?? 500
          )
        ) + (options?.autosniping?.wait1 ?? 500)
      }
      result = await xWait(loopState.sameStepCount, loopState.currentWaitTime)
      break


    default:
      console.log('Unknown step', loopState.steps[loopState.stepIdx])
      abortLoop()
      break
  }

  // console.log(LOOP_STEP_NAMES[currentStep], result, loopState.sameStepCount, loopState.currentWaitTime)

  if (loopState.decisions[currentStep]?.[result]) {
    let decision = loopState.decisions[currentStep][result]
    if (decision === loopState.steps.length) {
      sendNotification('Success', 'Item bought')
      abortLoop()
      return
    } else if (decision === -1) {
      abortLoop()
      return
    } else {
      let nextIdx = loopState.decisions[currentStep][result]
      if (nextIdx >= 0) {
        loopState.stepIdx = nextIdx
        loopState.sameStepCount = 0
      } else {
        console.log('Unknown decision', decision)
        abortLoop()
        return
      }
    }
  } else {
    if (result === -1) {
      loopState.errors += 1
    }
    if (result === 1) {
      loopState.stepIdx++
      loopState.sameStepCount = 0
      loopState.currentWaitTime = -1
    }
    if (result === 2) {
      loopState.errors += 1
    }
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

  if (loopState.snipedCards >= (options?.autosniping?.max_cards ?? 10)) {
    console.log('Sniped item limit reached, stopping')
    abortLoop()
  }

  let loop_interval = options?.general?.loop_interval ?? 1000
  if ((loopState.sameStepCount * loop_interval) > loopState.maxStepDuration) {
    console.log('Step taking too long, stopping')
    abortLoop()
  }
}

const startLoop = (steps, looping = false, decisions = {},) => {
  if (loopIntervalId) {
    abortLoop()
  }

  loopState = JSON.parse(JSON.stringify(defaultLoopState))
  loopState.steps = steps
  loopState.looping = looping
  loopState.decisions = decisions

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
  options.autosniping.enabled = false
  lastSnipingState = false
  saveOptions()
}

const searchAndBuyNowLoop = () => {
  startLoop([LoopSteps.SEARCH, LoopSteps.CHECK_RESULTS, LoopSteps.BUY, LoopSteps.ACKNOWLEDGE, LoopSteps.TRANSMIT])
}

const buyNowLoop = () => {
  startLoop([LoopSteps.BUY, LoopSteps.ACKNOWLEDGE, LoopSteps.TRANSMIT])
}

const searchLoop = () => {
  startLoop([LoopSteps.SEARCH, LoopSteps.CHECK_RESULTS])
}

const startSniping = () => {
  resetCurrentSessionStats()
  let steps = [
    LoopSteps.SEARCH,
    LoopSteps.CHECK_RESULTS,
    LoopSteps.BUY,
    LoopSteps.ACKNOWLEDGE,
    LoopSteps.TRANSMIT,
    LoopSteps.WAIT,
  ]

  if (options?.autosniping?.autolist) {
    steps.push(...[
      LoopSteps.WAIT,
      LoopSteps.LIST_ITEM,
      LoopSteps.WAIT,
      LoopSteps.WAIT,
    ])
  }
  steps.push(...[
    LoopSteps.GO_BACK,
    LoopSteps.WAIT,
    LoopSteps.ADJUST_FILTER,
    LoopSteps.WAIT
  ])

  let decisions = {
    [LoopSteps.CHECK_RESULTS]: {
      2: steps.length - 5,
    },
    [LoopSteps.TRANSMIT]: {
      1: options?.autosniping?.max_cards == 1 ? steps.length : undefined,
      [-1]: steps.length - 5,
    }
  }
  startLoop(steps, true, decisions)
}

async function decreaseIncreasePrices(idx, decrease, bound = -1) {
  // var priceValue = document.getElementsByClassName("ut-number-input-control")[idx].value;

  var incDecClass = '.increment-value';
  if (decrease) {
    incDecClass = '.decrement-value';
  }

  var decIncButtons = document.querySelectorAll(incDecClass)
  var decIncButton = decIncButtons[idx]

  if (!decIncButton || decIncButton.classList.contains("disabled")) {
    return
  }
  await clickButton(decIncButton)
}

const goBack = async () => {
  abortLoop()

  var backButton = document.querySelector(".ut-navigation-button-control");
  if (!backButton) {
    return -1
  }
  return await clickButton(backButton);
}

async function enterPriceAndListNow() {
  var detailpanel = document.querySelector(".DetailPanel");
  if (!detailpanel) {
    console.log('no detailpanel')
    return -1
  }

  var numberInputs = detailpanel.querySelectorAll(".ut-number-input-control") as NodeListOf<HTMLInputElement>;
  if (numberInputs.length < 2) {
    console.log('no 2 number inputs')
    return -1
  }

  var bidPriceInput = numberInputs[0];
  var buyNowPriceInput = numberInputs[1];
  bidPriceInput.value = options?.listitem?.bidprice ?? 500;
  buyNowPriceInput.value = options?.listitem?.buynowprice ?? 10000;

  var listNowButton = detailpanel.querySelector(".call-to-action");
  if (!listNowButton || listNowButton.classList.contains("disabled") || listNowButton.textContent !== "List for Transfer") {
    console.log('no valid listnow button')
    return -1
  }
  return await clickButton(listNowButton);
}

async function listNow() {
  var detailpanel = document.querySelector(".DetailPanel");
  var listNowButton = detailpanel?.querySelector(".call-to-action");

  if (!listNowButton || listNowButton.classList.contains("disabled") || listNowButton.textContent !== "List for Transfer") {
    console.log('no valid listnow button')
    return -1
  }
  return await clickButton(listNowButton);
}

document.addEventListener("keydown", async (event) => {
  if (document.activeElement?.tagName === 'INPUT') {
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
      searchLoop();
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
    case 't':
      if (options.autosniping.enabled) {
        options.autosniping.enabled = false
      } else {
        options.autosniping.enabled = true
      }
      saveOptions()
      break
    default:
      console.log(event);
      break;
  }
})

// save options
const saveOptions = async () => {
  await storage.set(options)
}

// load the settings from storage
const loadOptions = async () => {
  const data = await storage.get();
  Object.assign(options, data)
  console.log('loaded options', options)

  if (options?.autosniping?.enabled && !lastSnipingState) {
    lastSnipingState = true
    startSniping()
  } else if (!options?.autosniping?.enabled && lastSnipingState) {
    lastSnipingState = false
    abortLoop()
  }
}
loadOptions()

// listen for changes to the settings & update the object
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'sync') {
    // console.log(changes);
    await loadOptions();
  }
});

const sendNotification = (title, message) => {
  chrome.runtime.sendMessage({
    type: 'notification',
    options: {
      title: title,
      message: message,
      iconUrl: './logo.png',
      type: 'basic',
    }
  })
}

const resetCurrentSessionStats = async () => {
  const data = await stats.get();
  data.currentSession = JSON.parse(JSON.stringify(defaultStats.currentSession))
  await stats.set(data)
}

const statsAddSniped = async (coins: number) => {
  const data = await stats.get();

  data.total.snipedCards++
  data.total.coinsSpent += coins
  data.currentSession.snipedCards++
  data.currentSession.coinsSpent += coins

  await stats.set(data)
}

const statsAddSearch = async () => {
  const data = await stats.get();

  data.total.searches++
  data.currentSession.searches++

  await stats.set(data)
}


// // load the iframe
// import './index.scss'
// 
// const src = chrome.runtime.getURL('src/content-script/iframe/index.html')
// 
// const iframe = new DOMParser().parseFromString(
//   `<iframe class="crx-iframe" src="${src}"></iframe>`,
//   'text/html'
// ).body.firstElementChild
// 
// if (iframe) {
//   document.body?.append(iframe)
// }
// import './index.scss'
