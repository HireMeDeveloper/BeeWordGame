var validLetters = "utirmpy";

var rankingNames = [
    "Beginner",
    "Good Start",
    "Moving Up",
    "Good",
    "Solid",
    "Nice",
    "Great",
    "Amazing",
    "Genius"
]

var rankingValues = [
    0,
    4,
    9,
    15,
    28,
    47,
    75,
    94,
    132
]

var rankupValues = [
    4,
    9,
    15,
    28,
    47,
    75,
    94,
    132,
    999
]

var rankingBarWidths = [
    "4em",
    "5.25em",
    "6.5em",
    "7.75em",
    "9em",
    "10.25em",
    "11.5em",
    "12.75em",
    "14em",
]

function loadGame() {
    updateWordsLists()
}

function LoadLettersIntoPuzzle() {
    var index = 0
    var mainKey = document.querySelector("[data-center]")
    var mainText = mainKey.querySelector(".hex-text")
    mainText.textContent = validLetters[index].toUpperCase()
    index++

    var keys = document.querySelectorAll("[data-key]")
    keys.forEach(key => {
        if (key.hasAttribute("data-center") == false) {
            var text = key.querySelector(".hex-text")
            text.textContent = validLetters[index].toUpperCase()
            index++
        }
    })
}

function handleMouseClick(e) {
    if (e.target.matches("[data-key]")) {
        var text = e.target.querySelector(".hex-text")
        pressKey(text.textContent)
        return
    }

    if (e.target.matches("[data-enter]")) {
        submitGuess()
        return
    }

    if (e.target.matches("[data-delete]")) {
        deleteKey()
        return
    }

    if (e.target.matches("[data-shuffle]")) {
        validLetters = shuffleKey(validLetters)
        LoadLettersIntoPuzzle()
        return
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter") {
        submitGuess()
        return
    }

    if (e.key === "Backspace" || e.key === "Delete") {
        deleteKey()
        return
    }

    if (isValidLetter(e.key)) {
        pressKey(e.key)
        return
    } 
}

function isValidLetter(key) {
    return validLetters.includes(key)
}

function shuffleKey(str) {
    if (str.length <= 1) return str;
    let firstLetter = str[0];

    let restOfString = str.slice(1);

    let shuffledArray = restOfString.split('');
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return firstLetter + shuffledArray.join('');
}

function pressKey(key) {
    var input = document.querySelector("[data-input]")
    var newDiv = document.createElement("div")
    if (validLetters[0].toLocaleLowerCase() == key.toLocaleLowerCase()) {
        newDiv.classList.add("gold")
    }
    newDiv.textContent = key.toUpperCase()
    input.appendChild(newDiv)
}

function deleteKey() {
    var input = document.querySelector("[data-input]")
    if (input.lastElementChild) {
        // Remove the last div (child) from the container
        input.removeChild(input.lastElementChild);
    }
}

function submitGuess() {
    var input = document.querySelector("[data-input]")
    var guess = input.textContent;

    if (guess.toLowerCase().includes(validLetters[0]) == false) {
        showAlert("Not using the center letter!");
        input.textContent = ""
        return
    }

    if (guess.length < 4) {
        showAlert("Word too short!");
        input.textContent = ""
        return
    }

    if (allWords.includes(guess.toLowerCase()) == false) {
        showAlert("Not a valid word!");
        input.textContent = ""
        return
    }

    if (gameState.words.includes(guess.toLowerCase())) {
        showAlert("Word already used!");
        input.textContent = ""
        return
    }

    var points = calculatePointsForGuess(guess)
    var hasPanagram = (points > guess.length)

    gameState.points += points
    gameState.panagrams += hasPanagram ? 1 : 0
    gameState.currentRating = getRatingName(gameState.points)
    storeGameStateData();

    if (hasPanagram) showAlert("Panagram! +7 " + guess + ": +" + (points - 7));
    else showAlert(guess + ": +" + points);

    gameState.words.push(guess.toLowerCase())
    storeGameStateData()

    input.textContent = ""

    updateWordsLists()
}

function getRatingName(points) { 
    for (let i = 0; i < rankupValues.length; i++) {
        if (points < rankupValues[0]) return rankingNames[0]
        else if (points < rankupValues[1]) return rankingNames[1]
        else if (points < rankupValues[2]) return rankingNames[2]
        else if (points < rankupValues[3]) return rankingNames[3]
        else if (points < rankupValues[4]) return rankingNames[4]
        else if (points < rankupValues[5]) return rankingNames[5]
        else if (points < rankupValues[6]) return rankingNames[6]
        else if (points < rankupValues[7]) return rankingNames[7]
        else return rankingNames[8]
    }
}

function getRatingIndex(points) {
    for (let i = 0; i < rankupValues.length; i++) {
        if (points < rankupValues[0]) return 0
        else if (points < rankupValues[1]) return 1
        else if (points < rankupValues[2]) return 2
        else if (points < rankupValues[3]) return 3
        else if (points < rankupValues[4]) return 4
        else if (points < rankupValues[5]) return 5
        else if (points < rankupValues[6]) return 6
        else if (points < rankupValues[7]) return 7
        else return 8
    }
}

function updateWordsLists() {
    if (gameState.words.length == 0) return;

    var smallList = document.querySelector("[data-word-list-small]")
    var smallText = ""
    var end = 0

    if (gameState.words.length > 3) end = gameState.words.length - 3

    for (let i = gameState.words.length - 1; i >= end; i--) {
        smallText += (capitalizeFirstLetter(gameState.words[i]) + "&nbsp;&nbsp; ")
    }
    smallList.innerHTML = smallText

    var fullList = document.querySelector("[data-word-list-full]")
    var fullText = ""

    for (let i = gameState.words.length - 1; i >= 0; i--) { 
        var word = gameState.words[i]
        fullText += (capitalizeFirstLetter(word) + "&nbsp;&nbsp; ")
    }
    fullList.innerHTML = fullText

    var wordCount = document.querySelector("[data-word-count]")
    wordCount.textContent = "You have found " + gameState.words.length + " words"
}

function calculatePointsForGuess(guess) {
    var letters = guess.split('')

    if (letters.length >= 7) {
        validLetters.split('').forEach(letter => {
            if (letters.includes(letter) == false) {
                return letters.length
            }
        })

        return letters.length + 7
    }
    else
    {
        return letters.length
    }
}

function capitalizeFirstLetter(str) {
    if (str.length === 0) return str; // Check if the string is empty
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateRankings() {
    var currentPoints = gameState.points
    var currentRank = "Beginner"
    var overallNextRank = null

    var overallPointsToNext = null

    var rankings = document.querySelectorAll("[data-rank]")
    rankings.forEach((rank) => {
        var value = rank.dataset.rankValue;
        var number = rank.querySelector("[data-rank-number]")
        number.textContent = currentPoints

        var next;
        var nextRank = null
        var pointsToNext = null

        var subtitle = rank.querySelector("[data-subtitle]")
        if (rank.hasAttribute("data-rank-next-value")) { 
            next = rank.dataset.rankNextValue
            nextRank = rank.dataset.rankNext

            pointsToNext = rank.dataset.rankNextValue - currentPoints

            var pointsToGenius = 132 - currentPoints

            subtitle.textContent = pointsToNext + " points to next rank, " + pointsToGenius + " points to Genius"
        }
        else {
            next = 999

            var extraPoints = currentPoints - 132
            subtitle.textContent = "You have made it to Genius with " + extraPoints + " extra points!"
        }

        if (currentPoints >= value && currentPoints < next) {
            rank.classList.add("highlight")
            var divs = rank.querySelectorAll("div")
            divs.forEach((div) => {
                div.classList.add("highlight")
            })
            currentRank = rank.dataset.rank

            overallPointsToNext = (pointsToNext != null) ? pointsToNext : null
            overallNextRank = (nextRank != null) ? nextRank : null
        } else {
            rank.classList.remove("highlight")
            var divs = rank.querySelectorAll("div")
            divs.forEach((div) => {
                div.classList.remove("highlight")
            })
        }
    })

    var header = document.querySelector("[data-rankings-header]")
    var divs = header.querySelectorAll("div")
    divs.forEach((div) => {
        var value = div.dataset.rankValue
        var next = 999

        if (div.hasAttribute("data-rank-next")) {
            next = div.dataset.rankNext
        }

        if (value > currentPoints) {
            div.classList.remove("yellow")
            div.classList.remove("active")
            div.textContent = ""
            div.onclick = null
        } else if (currentPoints >= value && currentPoints < next) {
            div.classList.add("active")
            div.classList.remove("yellow")
            div.textContent = currentPoints
            div.onclick = () => showPage("rankings")
        } else {
            div.classList.remove("active")
            div.classList.add("yellow")
            div.textContent = ""
            div.onclick = null
        }
    })

    var info = document.querySelector("[data-rankings-header-info]")
    if (overallPointsToNext != null) {
        info.textContent = overallPointsToNext + " to " + overallNextRank
    } else {
        info.textContent = "Great job!"
    }

    var rank = document.querySelector("[data-rankings-header-rank]")
    rank.textContent = currentRank
}

function updateStats() {
    var totalGames = cumulativeData.length
    var totalWords = 0
    var totalPoints = 0
    var totalPanagrams = 0
    var ratings = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ]

    cumulativeData.forEach(game => {
        totalWords += game.words.length
        totalPoints += game.points
        totalPanagrams += game.panagrams

        if (game.points < rankupValues[0]) ratings[0]++
        else if (game.points < rankupValues[1]) ratings[1]++
        else if (game.points < rankupValues[2]) ratings[2]++
        else if (game.points < rankupValues[3]) ratings[3]++
        else if (game.points < rankupValues[4]) ratings[4]++
        else if (game.points < rankupValues[5]) ratings[5]++
        else if (game.points < rankupValues[6]) ratings[6]++
        else if (game.points < rankupValues[7]) ratings[7]++
        else ratings[8]++
    })

    var mostFrequentRatingName = "Beginner"
    var mostFrequentRating = 0

    for (let i = 0; i < rankingValues.length; i++) {
        if (ratings[i] > mostFrequentRating) {
            mostFrequentRating = ratings[i]
            mostFrequentRatingName = rankingNames[i]
        }
    }

    var wordsFound = document.querySelector("[data-stats-words-found]")
    wordsFound.textContent = totalWords

    var gamesPlayed = document.querySelector("[data-stats-games-played]")
    gamesPlayed.textContent = totalGames

    var averageWords = document.querySelector("[data-stats-average-words]")
    averageWords.textContent = (totalWords / totalGames).toFixed(1)

    var panagrams = document.querySelector("[data-stats-panagrams-found]")
    panagrams.textContent = totalPanagrams

    var frequentRating = document.querySelector("[data-stats-frequent-rating]")
    frequentRating.textContent = mostFrequentRatingName

    var thisWeekBars = document.querySelectorAll("[data-stats-this-bar]")
    var thisWeekRanks = document.querySelectorAll("[data-stats-this]")
    var lastWeekBars = document.querySelectorAll("[data-stats-bar-last]")
    var lastWeekRanks = document.querySelectorAll("[data-stats-last]")

    var dayOfWeek = getDayOfTheWeekFromGameNumber(gameState.gameNumber)
    var lastSundayGameNumber = gameState.gameNumber - dayOfWeek;

    var thisWeekData = new Array(7).fill(null);
    var lastWeekData = new Array(7).fill(null);

    var mockData = [
        {
            number: 225,
            words: gameState.words,
            points: 0,
            panagrams: gameState.panagrams,
            rating: gameState.currentRating
        },
        {
            number: 224,
            words: gameState.words,
            points: 0,
            panagrams: gameState.panagrams,
            rating: gameState.currentRating
        },
        {
            number: 223,
            words: gameState.words,
            points: 20,
            panagrams: gameState.panagrams,
            rating: gameState.currentRating
        },
        {
            number: 222,
            words: gameState.words,
            points: 120,
            panagrams: gameState.panagrams,
            rating: gameState.currentRating
        },
        {
            number: 221,
            words: gameState.words,
            points: 60,
            panagrams: gameState.panagrams,
            rating: gameState.currentRating
        },
        {
            number: 220,
            words: gameState.words,
            points: 200,
            panagrams: gameState.panagrams,
            rating: gameState.currentRating
        },
        {
            number: 219,
            words: gameState.words,
            points: 100,
            panagrams: gameState.panagrams,
            rating: gameState.currentRating
        },
        {
            number: 218,
            words: gameState.words,
            points: 100,
            panagrams: gameState.panagrams,
            rating: gameState.currentRating
        },
        {
            number: 100,
            words: gameState.words,
            points: 200,
            panagrams: gameState.panagrams,
            rating: gameState.currentRating
        },
        {
            number: 250,
            words: gameState.words,
            points: 200,
            panagrams: gameState.panagrams,
            rating: gameState.currentRating
        }

    ]

    cumulativeData.forEach(game => {
        var daysSinceSunday = game.number - lastSundayGameNumber;
        var dayOfTheWeek = getDayOfTheWeekFromGameNumber(game.number);

        if (daysSinceSunday >= 0 && daysSinceSunday < 7) {
            thisWeekData[dayOfTheWeek] = game;
        } else if (daysSinceSunday > -7 && daysSinceSunday < 7){
            lastWeekData[dayOfTheWeek] = game;
        }
    });

    for (let i = 0; i < 7; i++) {
        if (thisWeekData[i]) {
            var ratingName = getRatingName(thisWeekData[i].points);
            var ratingWidth = rankingBarWidths[getRatingIndex(thisWeekData[i].points)];

            console.log("Points: " + thisWeekData[i].points + " Rating: " + ratingWidth + " Index: " + getRatingIndex(thisWeekData[i].points))

            thisWeekBars[i].style.width = ratingWidth;
            thisWeekRanks[i].textContent = ratingName;
        } else {
            thisWeekBars[i].style.width = "0em";
            thisWeekRanks[i].textContent = "--";
        }

        if (lastWeekData[i]) {
            var ratingName = getRatingName(lastWeekData[i].points);
            var ratingWidth = rankingBarWidths[getRatingIndex(lastWeekData[i].points)];

            lastWeekBars[i].style.width = ratingWidth;
            lastWeekRanks[i].textContent = ratingName;
        } else {
            lastWeekBars[i].style.width = "0em";
            lastWeekRanks[i].textContent = "--";
        }
    }
}