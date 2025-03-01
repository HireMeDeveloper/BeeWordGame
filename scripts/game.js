var validLetters = "utirmpy";
var words = []

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

    if (guess.toLocaleLowerCase().includes(validLetters[0]) == false) {
        showAlert("Not using the center letter!");
        return
    }

    if (guess.length < 4) {
        showAlert("Word too short!");
        return
    }

    if (allWords.includes(guess.toLowerCase()) == false) {
        showAlert("Not a valid word!");
        return
    }

    if (words.includes(guess.toLowerCase())) {
        showAlert("Word already used!");
        return
    }

    showAlert("Word added: " + guess);

    words.push(guess.toLowerCase())
    input.textContent = ""

    updateWordsLists()
}

function updateWordsLists() {
    if (words.length == 0) return;

    var smallList = document.querySelector("[data-word-list-small]")
    var smallText = ""
    var end = 0

    if (words.length > 3) end = words.length - 3

    for (let i = words.length - 1; i >= end; i--) {
        smallText += (capitalizeFirstLetter(words[i]) + "&nbsp;&nbsp;&nbsp;")
    }
    smallList.innerHTML = smallText

    var fullList = document.querySelector("[data-word-list-full]")
    var fullText = ""
    words.forEach(word => {
        fullText += (capitalizeFirstLetter(word) + "&nbsp;&nbsp;&nbsp;")
    })
    fullList.innerHTML = fullText

    var wordCount = document.querySelector("[data-word-count]")
    wordCount.textContent = "You have found " + words.length + " words"
}

function capitalizeFirstLetter(str) {
    if (str.length === 0) return str; // Check if the string is empty
    return str.charAt(0).toUpperCase() + str.slice(1);
}