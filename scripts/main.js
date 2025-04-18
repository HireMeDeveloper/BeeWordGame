const DATE_OF_FIRST_PUZZLE = new Date(2024, 6, 25)
const DAYS_OF_THE_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const ALLOW_MOBILE_SHARE = true; 

const DICTIONARY = "resources/Dictionary.json";

const targetWordsLength = 100

const alertContainer = document.querySelector("[data-alert-container]")
const statsAlertContainer = document.querySelector("[data-stats-alert-container]")
const shareButton = document.querySelector("[data-share-button]")
const playButton = document.querySelector("[data-play-button]")

const todaysStatisticGrid = document.querySelector("[data-statistics-today]");
const overallStatisticGrid = document.querySelector("[data-statistics-overall]");

let canInteract = false;

window.dataLayer = window.dataLayer || [];

var allWords = []
let sevenLetterWords = [];

let targetGameNumber = 0
let yesterdaysGameNumber = 0

let currentLetters = "";
let yesterdaysLetters = "";

let currentPuzzleList = []
let yesterdaysPuzzleList = []

let gameState = {
    gameNumber: 0,
    currentLetters: "",
    yesterdaysLetters: "",
    yesterdaysAnswers: [],
    words: [],
    rankValues: [],
    rankUpValues: [],
    points: 0,
    maxPoints: 0,
    panagrams: 0,
    currentRating: "Beginner",
    completed: false,
    hasOpenedPuzzle: false
}
let cumulativeData = []

// Game: {
//     words: [],
//     points: 0,
//     panagrams: 0,
//     rating: "Beginner",
//}

fetchInfo()

console.log("Day of the week: " + DAYS_OF_THE_WEEK[getDayOfTheWeekFromGameNumber(gameState.gameNumber)]);

async function fetchInfo() {
    try {
        const response = await fetch(DICTIONARY);
        const json = await response.json();
        allWords = Object.keys(json);

        // Create 7 letter list, and select word based on day offset
        sevenLetterWords = allWords.filter(word => word.length === 7 && hasDuplicateLetters(word) == false);

        console.log("Total Words: " + allWords.length);
        console.log("7 Letter Words: " + sevenLetterWords.length);

        targetGameNumber = getGameNumberForDate(new Date());
        yesterdaysGameNumber = getGameNumberForDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

        currentLetters = getLettersFromGameNumber(targetGameNumber);
        yesterdaysLetters = getLettersFromGameNumber(yesterdaysGameNumber);

        currentPuzzleList = getPuzzleListFromShuffledWord(currentLetters);
        yesterdaysPuzzleList = getPuzzleListFromShuffledWord(yesterdaysLetters);

        console.log("The number of possible words are: " + currentPuzzleList.length)
        console.log("The words are: " + currentPuzzleList.toString())

        fetchCumulativeData()
        fetchGameState()

        validLetters = currentLetters;
        LoadLettersIntoPuzzle()
        startInteraction()

        updateYesterdayMenu()
    } catch (error) {
        console.error('Error reading JSON file:', error);
    }
}

function hasDuplicateLetters(word) {
    const letterSet = new Set();
    for (const letter of word) {
        if (letterSet.has(letter)) {
            return true;
        }
        letterSet.add(letter);
    }
    return false;
}

function getGameNumberForDate(date) {
    const msOffset = date - DATE_OF_FIRST_PUZZLE
    const dayOffset = msOffset / 1000 / 60 / 60 / 24

    return Math.floor(dayOffset) % sevenLetterWords.length
}

function getLettersFromGameNumber(gameNumber) {
    let selectedWord = sevenLetterWords[gameNumber]
    console.log("The current word was: " + selectedWord)

    let shuffledWord = shuffleString(selectedWord, gameNumber)
    console.log("The current letters are: " + shuffledWord)
    return shuffledWord;
}

function getPuzzleListFromShuffledWord(shuffledWord) {
    const selectedWordLetters = new Set(shuffledWord.split(''));

    const validWordsForSelectedWord = allWords.filter(word => {
        // Check if every letter in the word is part of the shuffled word's letters
        const wordLetters = new Set(word.split(''));
        return [...wordLetters].every(letter => selectedWordLetters.has(letter));
    });

    const selectedLetter = shuffledWord[0]; // Choosing the first letter as an example
    var filtered = validWordsForSelectedWord.filter(word => word.includes(selectedLetter));

    console.log("Valid Words for Selected Word: " + filtered.length);
    console.log("The words are: " + filtered.toString());

    return filtered;
}

function shuffleString(str, seed) {
    // Convert the string to an array of characters
    const arr = str.split('');

    // Seeded random function using mulberry32 algorithm
    function mulberry32(a) {
        return function() {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    const random = mulberry32(seed);

    // Shuffle the array using the Fisher-Yates algorithm
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }

    // Join the array back into a string
    return arr.join('');
}

function calculateMaxPoints(words) {
    var total = 0

    words.forEach(word => {
        var points = calculatePointsForGuess(word)
        total += points
    });

    return total
}

function showAlert(message, duration = 1000) {
    if (duration === null) {
        clearAlerts()
    }

    const alert = document.createElement("div")
    alert.innerHTML = message
    alert.classList.add("alert")
    
    alertContainer.prepend(alert)
    if (duration == null) return

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function clearAlerts() {
    const alerts = document.querySelectorAll('.alert')

    alerts.forEach((alert) => {
        alert.remove()
    })
}

function showShareAlert(message, duration = 1000) {
    clearAlerts()

    const alert = document.createElement("div")
    alert.textContent = message
    alert.classList.add("alert")

    statsAlertContainer.append(alert)

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function showPage(pageId, oldPage = null) {
    if (oldPage === null) {
        const page = document.querySelector('.page.active')
        if (page != null) {
            oldPage = page.id
        } else {
            oldPage = "game"
        }
    }

    if (pageId != "welcome" && pageId != "game" && pageId != "info" && pageId != "stats" && pageId != "yesterday" && pageId != "rankings") {
        console.log("Invalid page: " + pageId + ". Openning 'game' page.")
        pageId = "game"
    }

    const pages = document.querySelectorAll('.page')
    pages.forEach(page => {
        page.classList.remove('active')
    })

    document.getElementById(pageId).classList.add('active')
    if (pageId === "game") {
        gameState.hasOpenedPuzzle = true
        storeGameStateData()
        resetWordsDropdowns()

        loadGame()
        updateBodyColor(true)
    } else if (pageId === "stats") {
        updateBodyColor(true)
    } else if (pageId === "welcome") {
        updateBodyColor(true)
        generateWelcomeMessage()
    } else if (pageId === "info") {
        updateBodyColor(true)
    } else if (pageId === "yesterday") { 
        updateBodyColor(true)
    } else if (pageId === "rankings") {
        updateBodyColor(true)
    }

    if (oldPage != null) lastPage = oldPage
}

function pressStatsButton(buttonId) {
    const statsButtons = document.querySelectorAll('[data-stats-button]')
    statsButtons.forEach(button => {
        button.classList.remove('selected')
    })

    const pressedButton = document.querySelector(`[data-${buttonId}]`)
    pressedButton.classList.add('selected')

    const statsOverlays = document.querySelectorAll('[data-stats-overlay]')
    statsOverlays.forEach(overlay => {
        overlay.classList.remove('active')
    })

    const pressedOverlay = document.querySelector(`[data-overlay-${buttonId}]`)
    pressedOverlay.classList.add('active')
}

function pressWordsDropdown() {
    const wordsDropdowns = document.querySelectorAll("[data-words-dropdown]")
    wordsDropdowns.forEach(dropdown => {
        dropdown.classList.toggle('enabled')
    })
}

function pressRankingsDropdown() {
    resetWordsDropdowns()
    const rankingsDropdowns = document.querySelectorAll("[data-rankings-dropdown]")
    rankingsDropdowns.forEach(dropdown => {
        dropdown.classList.toggle('enabled')
    })
}

function resetWordsDropdowns() {
    const dropdowns = document.querySelectorAll("[data-words-dropdown]");
    dropdowns.forEach(dropdown => {
        if (dropdown.hasAttribute("data-default")) {
            dropdown.classList.add('enabled');
        } else {
            dropdown.classList.remove('enabled');
        }

        //console.log("Resetting dropdown: " + dropdown.hasAttribute("data-default").toString());
    });
}

function resetRankingsDropdowns() {
    const dropdowns = document.querySelectorAll("[data-rankings-dropdown]");
    dropdowns.forEach(dropdown => {
        if (dropdown.hasAttribute("data-default")) {
            dropdown.classList.add('enabled');
        } else {
            dropdown.classList.remove('enabled');
        }

        //console.log("Resetting dropdown: " + dropdown.hasAttribute("data-default").toString());
    });
}

function updateBodyColor(isWhite) {
    document.body.classList.remove('white')
    document.body.classList.remove('off-white')

    document.body.classList.add((isWhite) ? 'white' : 'off-white')
}

function startInteraction() {
    document, addEventListener("click", handleMouseClick)
    document, addEventListener("keydown", handleKeyPress)

    canInteract = true
}

function stopInteraction() {
    document, removeEventListener("click", handleMouseClick)
    document, removeEventListener("keydown", handleKeyPress)

    canInteract = false
}

function storeGameStateData() {
    localStorage.setItem("word-wheel-game-state", JSON.stringify(gameState))
    updateCumulativeData();

    updateRankings()
}

function storeCumulativeData() {
    localStorage.setItem("word-wheel-cumulative-data", JSON.stringify(cumulativeData))
}

function fetchGameState() {
    const localStateJSON = localStorage.getItem("word-wheel-game-state")
    let localGameState = null
    if (localStateJSON != null) {
        localGameState = JSON.parse(localStateJSON)

        if (localGameState.gameNumber === (targetGameNumber)) {
            gameState = localGameState
        } else {
            console.log("Game state was reset since puzzle does not match: " + localGameState.gameNumber + " & " + targetGameNumber)
            resetGameState()
        }
    } else {
        console.log("Game state was reset since localStorage did not contain 'conundrumGameState'")
        resetGameState()
    }

    updateCumulativeData()

    if (gameState.hasOpenedPuzzle === true) {
        showPage("welcome")
    } else {
        showPage('info')
    }
}

function fetchCumulativeData() {
    const localStoreJSON = localStorage.getItem("word-wheel-cumulative-data")
    if (localStoreJSON != null) {
        console.log("Cumulative Data was Found: " + localStoreJSON)
        cumulativeData = JSON.parse(localStoreJSON)
        storeCumulativeData()
    } else {
        console.log("Cumulative Data was reset")
        resetCumulativeData()
    }
}

function resetGameState() { 
    var max = calculateMaxPoints(currentPuzzleList)
    var rankingValues = getRankValues(max)

    gameState = {
        gameNumber: targetGameNumber,
        currentLetters: currentLetters,
        yesterdaysLetters: yesterdaysLetters,
        yesterdaysAnswers: yesterdaysPuzzleList,
        words: [],
        rankValues: rankingValues,
        rankUpValues: getRankUpValues(rankingValues),
        points: 0,
        maxPoints: max,
        panagrams: 0,
        currentRating: "Beginner",
        isComplete: false,
        hasOpenedPuzzle: false
    }
    storeGameStateData()
}

function resetCumulativeData() {
    cumulativeData = []
    storeCumulativeData()
}

function getRankValues(currentMax) {
    var newCurrentMax = Math.floor(currentMax * 0.75)

    var remainder = newCurrentMax % 35
    var quotient = Math.floor(newCurrentMax / 35)

    var values = [
        0,
        1 * quotient,
        3 * quotient,
        5 * quotient,
        9 * quotient,
        14 * quotient,
        20 * quotient,
        27 * quotient,
        roundToNearestTen(35 * quotient + remainder) 
    ]

    console.log("Values: " + values.toString() + " From max: " + currentMax + " GamestateMax: " + gameState.maxPoints)
    //console.log("Current puzzle list: " + currentPuzzleList.toString())

    return values;
}

function roundToNearestTen(number) {
    return Math.round(number / 10) * 10;
}

function getRankUpValues(values) {
    return [
        values[1],
        values[2],
        values[3],
        values[4],
        values[5],
        values[6],
        values[7],
        values[8],
        999
    ]
}

function updateCumulativeData() {
    let todaysGame = {
        number: gameState.gameNumber,
        maxPoints: gameState.maxPoints,
        words: gameState.words,
        points: gameState.points,
        panagrams: gameState.panagrams,
        rating: gameState.currentRating
    }

    let hasEntry = cumulativeDataHasEntry(gameState.gameNumber)
    console.log("Has entry: " + hasEntry)

    if (hasEntry === false) {
        console.log("Pushing in new entry");

        cumulativeData.push(todaysGame);
        storeCumulativeData()
    } else {
        console.log("Updating old entry");
        let entryIndex = getCumulativeDataEntryIndex(gameState.gameNumber);

        cumulativeData[entryIndex] = todaysGame;
        storeCumulativeData()
    }

    updateStats()
}

function cumulativeDataHasEntry(gameNumber) {
    return cumulativeData.some(entry => {
        if (entry.number === gameNumber) {
            console.log("Found an equal number")
            return true;
        } else {
            console.log("Found no equal number")
            return false;
        }
    })
}

function getCumulativeDataEntryIndex(gameNumber) {
    const index = cumulativeData.findIndex(entry => entry.number === gameNumber);
    return index !== -1 ? index : null;
}

function getDayOfTheWeekFromGameNumber(gameNumber) {
    const msOffset = gameNumber * 24 * 60 * 60 * 1000; // Convert game number to milliseconds
    const targetDate = new Date(DATE_OF_FIRST_PUZZLE.getTime() + msOffset);
    var day = targetDate.getDay();

    // Returns the day of the week (0-6) starting with sunday
    //console.log("Returning day: " + day)
    return day;
}

function generateWelcomeMessage() {
    //console.log("generating message")

    const welcomeHeader = document.querySelector("[data-welcome-header]")
    const welcomeMessage = document.querySelector("[data-welcome-message]")
    const welcomeButton = document.querySelector("[data-welcome-button]")
    const welcomeDate = document.querySelector("[data-welcome-date]")
    const welcomeNumber = document.querySelector("[data-welcome-number]")

    if (gameState.isComplete != true) {
        welcomeHeader.textContent = "Welcome Back"
        welcomeMessage.innerHTML = "So far today, you've achieved the <br>rank of <b>" + gameState.currentRating + "</b> by finding <b>" + gameState.words.length +"</b> words<br> worth <b>" + gameState.points + "</b> points.<br><br>How far can you get by midnight?";
        welcomeMessage.classList.add('long')
        welcomeButton.textContent = "Continue"
        welcomeButton.onclick = () => {
            showPage('game')
            fireEvent("continueGame")
        }
    } else {
        welcomeHeader.textContent = "Hello"
        welcomeMessage.innerHTML = "There will be another <br> Word Wheel tomorrow.<br> See you then!"
        welcomeMessage.classList.remove('long')
        welcomeButton.textContent = "See Stats"
        welcomeButton.onclick = () => {
            showPage('stats')
            fireEvent("fromWelcomeToStats")
        }
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth();
    let dd = today.getDate();

    let months = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]

    if (dd < 10) dd = '0' + dd;

    const formattedToday = months[mm] + " " + dd + ", " + yyyy
    welcomeDate.textContent = formattedToday

    welcomeNumber.textContent = "No. " + (targetGameNumber)
}

function updateYesterdayMenu() {
    var yesterdayPuzzleTitle = document.querySelector("[data-yesterday-puzzle]")

    for (let i = 1; i < 4; i++) {
        var letter = yesterdaysLetters[i]
        var newDiv = document.createElement("div")
        newDiv.textContent = letter.toUpperCase()
        yesterdayPuzzleTitle.appendChild(newDiv)
    }

    var goldLetter = yesterdaysLetters[0]
    var goldDiv = document.createElement("div")
    goldDiv.classList.add("gold")
    goldDiv.textContent = goldLetter.toUpperCase()
    yesterdayPuzzleTitle.appendChild(goldDiv)

    for (let i = 4; i < 7; i++) {
        var letter = yesterdaysLetters[i]
        var newDiv = document.createElement("div")
        newDiv.textContent = letter.toUpperCase()
        yesterdayPuzzleTitle.appendChild(newDiv)
    }

    var yesterdayCumulative

    if (hasYesterdaysCumulativeEntry()) {
        console.log("Found yesterday's cumulative entry");
        yesterdayCumulative = getYesterdaysCumulativeEntry()
    } else {
        console.log("Did not find yesterday's cumulative entry");
        yesterdayCumulative = null
    }

    var yesterdayScore = (yesterdayCumulative != null) ? yesterdayCumulative.points : 0
    var yesterdayWordsLength = (yesterdayCumulative != null) ? yesterdayCumulative.words.length : 0

    var yesterdayDetails = document.querySelector("[data-yesterday-details]")
    var maxScore = calculateMaxPoints(gameState.yesterdaysAnswers)
    yesterdayDetails.textContent = yesterdayWordsLength + " of " + gameState.yesterdaysAnswers.length + " words | " + yesterdayScore + " of " + maxScore + " points"

    var yesterdayWords = document.querySelector("[data-yesterday-words]")

    //var yesterdayWordList = []]

    var yesterdayWordList = gameState.yesterdaysAnswers;

    var totalChars = yesterdayWordList.length
    yesterdayWordList.forEach(word => {
        totalChars += word.length
    })

    console.log("There are " + totalChars + " Chars")

    if (totalChars > 1200) {
        yesterdayWords.classList.add("smallest")
        console.log("Smallest")
    } else if (totalChars > 900) {
        yesterdayWords.classList.add("smaller")
        console.log("Smaller")
    } else if (totalChars > 540) {
        yesterdayWords.classList.add("small")
        console.log("Small")
    } else if (totalChars > 255) {
        yesterdayWords.classList.add("medium")
        console.log("Medium")
    } else {
        yesterdayWords.classList.add("large")
        console.log("Large")
    }

    var parent = yesterdayWords

    var charsUsed = 0;
    for (var word of yesterdayWordList) {
        charsUsed += word.length + 1 // +2 for the spaces

        var newDiv = document.createElement('div');

        if (charsUsed > 1560) { 
            newDiv.textContent = "...";
            parent.append(newDiv)
            break;
        } 

        newDiv.textContent = capitalizeFirstLetter(word)

        var points = calculatePointsForGuess(word, yesterdaysLetters)
        //console.log("Points was: " + points + " Length was: " + word.length)
        if (points > word.length) newDiv.classList.add("yesterday-word-highlighted")
        parent.append(newDiv)
    }
}

function hasYesterdaysCumulativeEntry() {
    var currentPuzzleNumber = gameState.gameNumber;
    if (currentPuzzleNumber == 0) return false;

    var yesterdayNumber = currentPuzzleNumber - 1;

    var foundEntry = false;
    cumulativeData.forEach(entry => {
        if (entry.number == yesterdayNumber) foundEntry = true;
    });

    return foundEntry;
}

function getYesterdaysCumulativeEntry() {
    var currentPuzzleNumber = gameState.gameNumber;
    if (currentPuzzleNumber == 0) return null;

    var yesterdayNumber = currentPuzzleNumber - 1;

    var yesterdaysEntry = null;
    cumulativeData.forEach(entry => {
        if (entry.number == yesterdayNumber) {
            yesterdaysEntry = entry;
        }
    });

    return yesterdaysEntry;
}

function updateInfoPage() {
    if (gameState.games[0].wasStarted === false) {
        playButton.textContent = "Play"
        playButton.onclick = function () {
            showPage("game")
            fireEvent("pressedPlay")
        } 
    } else {
        playButton.textContent = "Continue"
        playButton.onclick = function () {
            showPage("game")
        } 
    }
}

function processStats(cumulativeState) {
    let result = {
        today: {
            streak: 0,
            gamesPlayed: 0,
            wins: 0,
            hints: 0,
            countedHints: 0,
            gradeText: "N/A"
        },
        overall: {
            daysPlayed: cumulativeState.length,
            gamesPlayed: 0,
            wins: 0,
            hints: 0,
            countedHints: 0,
            gradeText: "N/A"
        }
    }

    cumulativeState.forEach((entry, i) => {
        let lastEntry = null
        if (i !== 0) {
            lastEntry = cumulativeState[i - 1];
        }

        let isNext = true;
        if (lastEntry !== null) {
            let currentNumber = Number(entry.number)
            let lastNumber = Number(lastEntry.number)
            isNext = (currentNumber === (lastNumber + 1))

            //console.log("Current Number: " + currentNumber + " LastNumber: " + lastNumber + " isNext: " + isNext)
        }

        if (isNext) {
            result.today.streak += 1
        } else {
            result.today.streak = 1
        }

        if (i === (cumulativeState.length - 1)) {
            result.today.gamesPlayed += entry.games;
            result.today.wins += entry.wins;
            result.today.hints += entry.hints;
            result.today.countedHints += entry.countedHints
        }

        result.overall.gamesPlayed += entry.games;
        result.overall.wins += entry.wins;
        result.overall.hints += entry.hints;
        result.overall.countedHints += entry.countedHints
    })

    if (result.today.gamesPlayed > 0) {
        let grade = getGrade(result.today.gamesPlayed, result.today.wins, result.today.countedHints)
        result.today.gradeText = grade + "%"
    }

    if (result.overall.gamesPlayed > 0) {
        let overallGrade = getGrade(result.overall.gamesPlayed, result.overall.wins, result.overall.countedHints)
        result.overall.gradeText = overallGrade + "%"
    }

    return result;
}

function pressShare() {
    let textToCopy = "Try Word Wheel! \nwww.independent.ie/wordwheel \nMy rank today: " + gameState.currentRating

    if (navigator.share && detectTouchscreen() && ALLOW_MOBILE_SHARE) {
        navigator.share({
            text: textToCopy
        })
    } else {
        navigator.clipboard.writeText(textToCopy)
        showShareAlert("Link Copied! Share with Your Friends!")
    }

    fireEvent("pressedShare");
}

function detectTouchscreen() {
    var result = false
    if (window.PointerEvent && ('maxTouchPoints' in navigator)) {
        if (navigator.maxTouchPoints > 0) {
            result = true
        }
    } else {
        if (window.matchMedia && window.matchMedia("(any-pointer:coarse)").matches) {
            result = true
        } else if (window.TouchEvent || ('ontouchstart' in window)) {
            result = true
        }
    }
    return result
}

function fireEvent(eventName) {
    const event = new CustomEvent(eventName)

    document.dispatchEvent(event)
    pushEventToDataLayer(event)

    console.log("EVENT: " + eventName)
}

function pushEventToDataLayer(event) {
    const eventName = event.type
    const eventDetails = event.detail

    window.dataLayer.push({
        'event': eventName,
        ...eventDetails
    })

    console.log(window.dataLayer)
}