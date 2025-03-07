var validLetters = "utirmpy";

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

function pressKey(key, ignoreLength = false) {
    var input = document.querySelector("[data-input]")
    input.textContent += key.toUpperCase()
}

function deleteKey() {
    var input = document.querySelector("[data-input]")
    var text = input.textContent
    if (text.length === 0) return

    text = text.slice(0, -1);
    input.textContent = text
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
    storeGameStateData();

    if (hasPanagram) showAlert("Panagram! +7 " + guess + ": +" + (points - 7));
    else showAlert(guess + ": +" + points);

    gameState.words.push(guess.toLowerCase())
    storeGameStateData()

    input.textContent = ""

    updateWordsLists()
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
        } else if (currentPoints >= value && currentPoints < next) {
            div.classList.add("active")
            div.classList.remove("yellow")
            div.textContent = currentPoints
        } else {
            div.classList.remove("active")
            div.classList.add("yellow")
            div.textContent = ""
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