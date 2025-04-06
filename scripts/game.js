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
            key.addEventListener("click", handleMouseClick)
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

    if (isValidLetter(e.key.toLowerCase())) {
        pressKey(e.key.toLowerCase())
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
    gameState.currentRating = getRatingName(gameState.points, calculateMaxPoints(currentPuzzleList))
    storeGameStateData();

    if (hasPanagram) showAlert("Panagram! +7<br>" + guess + ": +" + (points - 7));
    else if (guess.length == 4) showAlert(guess + ": +1");
    else showAlert(guess.length + " Letters!<br>" + guess + ": +" + points);

    gameState.words.push(guess.toLowerCase())
    storeGameStateData()

    input.textContent = ""

    updateWordsLists()
}

function getRatingName(points, maxPoints) { 
    var rankValues = getRankValues(maxPoints)
    var rankUpValues = getRankUpValues(rankValues)

    for (let i = 0; i < rankUpValues.length; i++) {
        if (points < rankUpValues[0]) return rankingNames[0]
        else if (points < rankUpValues[1]) return rankingNames[1]
        else if (points < rankUpValues[2]) return rankingNames[2]
        else if (points < rankUpValues[3]) return rankingNames[3]
        else if (points < rankUpValues[4]) return rankingNames[4]
        else if (points < rankUpValues[5]) return rankingNames[5]
        else if (points < rankUpValues[6]) return rankingNames[6]
        else if (points < rankUpValues[7]) return rankingNames[7]
        else return rankingNames[8]
    }
}

function getRatingIndex(points, maxPoints) {
    var rankValues = getRankValues(maxPoints)
    var rankUpValues = getRankUpValues(rankValues)

    for (let i = 0; i < rankUpValues.length; i++) {
        if (points < rankUpValues[0]) return 0
        else if (points < rankUpValues[1]) return 1
        else if (points < rankUpValues[2]) return 2
        else if (points < rankUpValues[3]) return 3
        else if (points < rankUpValues[4]) return 4
        else if (points < rankUpValues[5]) return 5
        else if (points < rankUpValues[6]) return 6
        else if (points < rankUpValues[7]) return 7
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

function calculatePointsForGuess(guess, testLetters = validLetters) {
    var letters = guess.toLowerCase().split('');
    let allLettersFound = true; // Assume all letters are found at first

    if (letters.length >= 7) {
        // Check each letter from testLetters
        for (let letter of testLetters.split('')) {
            if (!letters.includes(letter.toLowerCase())) {
                console.log("Letter not found: " + letter + " in " + guess); // Debugging output
                allLettersFound = false; // Mark that not all letters are found
                break; // Exit early because we found a letter not in the guess
            }
        }

        if (allLettersFound) {
            return letters.length + 7; // Bonus for containing all letters
        } else {
            return letters.length; // Just the length of the guess if not all letters are found
        }
    } else if (letters.length == 4) {
        return 1; // If guess is exactly 4 letters, return 1 point
    } else {
        return letters.length; // If guess is less than 7 letters and more than 4, return length
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
    rankings.forEach((rank, i) => {
        var index = 8 - i
        var geniusValue = gameState.rankValues[8]

        var value = gameState.rankValues[index];

        var rankVal = rank.querySelector("[data-val]")
        rankVal.textContent = value
            
            
        var number = rank.querySelector("[data-rank-number]")
        number.textContent = currentPoints

        //console.log("The Ranking was : " + value + " for " + index)

        var next;
        var nextRank = null
        var pointsToNext = null

        var subtitle = rank.querySelector("[data-subtitle]")
        if (rank.hasAttribute("data-rank-next-value")) { 
            next = gameState.rankUpValues[index]
            nextRank = rank.dataset.rankNext

            pointsToNext = next - currentPoints

            var pointsToGenius = geniusValue - currentPoints

            subtitle.textContent = pointsToNext + " points to next rank, " + pointsToGenius + " points to Genius"
        }
        else {
            next = 999

            var extraPoints = currentPoints - geniusValue
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
    divs.forEach((div, index) => {
        var value = gameState.rankValues[index]
        var next = gameState.rankUpValues[index]

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

    //var info = document.querySelector("[data-rankings-header-info]")
    //if (overallPointsToNext != null) {
    //    info.textContent = overallPointsToNext + " to " + overallNextRank
    //} else {
    //    info.textContent = "Great job!"
    //}

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

        if (game.points < gameState.rankUpValues[0]) ratings[0]++
        else if (game.points < gameState.rankUpValues[1]) ratings[1]++
        else if (game.points < gameState.rankUpValues[2]) ratings[2]++
        else if (game.points < gameState.rankUpValues[3]) ratings[3]++
        else if (game.points < gameState.rankUpValues[4]) ratings[4]++
        else if (game.points < gameState.rankUpValues[5]) ratings[5]++
        else if (game.points < gameState.rankUpValues[6]) ratings[6]++
        else if (game.points < gameState.rankUpValues[7]) ratings[7]++
        else ratings[8]++
    })

    var mostFrequentRatingName = "Beginner"
    var mostFrequentRating = 0

    for (let i = 0; i < gameState.rankValues.length; i++) {
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
            number: 246,
            maxPoints: 300,
            panagrams: 1,
            points: 300,
            rating: "Genius",
            words: ["bone", "moan", "note", "bonnet", "boat", "baboon", "boom", "moat", "bomb", "bottom"]
        },
        {
            number: 242,
            maxPoints: 300,
            panagrams: 1,
            points: 25,
            rating: "Genius",
            words: ["bone", "moan", "note", "bonnet", "boat", "baboon", "boom", "moat", "bomb", "bottom"]
        },
        {
            number: 241,
            maxPoints: 300,
            panagrams: 1,
            points: 25,
            rating: "Genius",
            words: ["bone", "moan", "note", "bonnet", "boat", "baboon", "boom", "moat", "bomb", "bottom"]
        },
        {
            number: 240,
            maxPoints: 300,
            panagrams: 1,
            points: 25,
            rating: "Genius",
            words: ["bone", "moan", "note", "bonnet", "boat", "baboon", "boom", "moat", "bomb", "bottom"]
        },
        {
            number: 238,
            maxPoints: 300,
            panagrams: 1,
            points: 200,
            rating: "Genius",
            words: ["bone", "moan", "note", "bonnet", "boat", "baboon", "boom", "moat", "bomb", "bottom"]
        }
    ]

    cumulativeData.forEach(game => {
        var daysSinceSunday = game.number - lastSundayGameNumber;
        var dayOfTheWeek = getDayOfTheWeekFromGameNumber(game.number);

        //console.log("Days since sunday: " + daysSinceSunday + " Day of week: " + dayOfTheWeek)

        if (daysSinceSunday >= 0 && daysSinceSunday < 7) {
            thisWeekData[dayOfTheWeek] = game;
        } else if (daysSinceSunday > -7 && daysSinceSunday < 7){
            lastWeekData[dayOfTheWeek] = game;
        }
    });

    for (let i = 0; i < 7; i++) {
        if (thisWeekData[i]) {
            var ratingName = getRatingName(thisWeekData[i].points, thisWeekData[i].maxPoints);
            var ratingWidth = rankingBarWidths[getRatingIndex(thisWeekData[i].points, thisWeekData[i].maxPoints)];

            //console.log("Points: " + thisWeekData[i].points + " Rating: " + ratingWidth + " Index: " + getRatingIndex(thisWeekData[i].points, thisWeekData[i].maxPoints))

            thisWeekBars[i].style.width = ratingWidth;
            thisWeekRanks[i].textContent = ratingName;
        } else {
            thisWeekBars[i].style.width = "0em";
            thisWeekRanks[i].textContent = "--";
        }

        if (lastWeekData[i]) {
            var ratingName = getRatingName(lastWeekData[i].points, lastWeekData[i].maxPoints);
            var ratingWidth = rankingBarWidths[getRatingIndex(lastWeekData[i].points, lastWeekData[i].maxPoints)];

            lastWeekBars[i].style.width = ratingWidth;
            lastWeekRanks[i].textContent = ratingName;
        } else {
            lastWeekBars[i].style.width = "0em";
            lastWeekRanks[i].textContent = "--";
        }
    }
}