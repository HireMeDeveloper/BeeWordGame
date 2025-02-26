Summary:
    This is a file that compiles a handful of notes to make testing the implementation easier.

Notes on Implementation:
    Start Date:
        
    Updating Dictionaries:
        The dictionary for these puzzles will be in CSV format. The first item of each entry will be the letters for the puzzle, with the first letter being the middle letter.
        Then follow up with each word for the puzzle.
        Example: 
            UTIMYPR,Putt,Yurt,Purity
            AEGNR,Anger,Range,Earn
            SOTARM,Roam,Storm,Smart
            LDWOOR,World,Word,Lord
    Events:
        There are a handful of events, as requested, that are sent to the data layer.
        Each of these events are based around the buttons that players use in the game.
            fromWelcomeToStats: this event is fired when a player presses the stats button from the welcome page.
            pressedShare: this event is fired when a player presses the share button.
            gameThreeToStats: this event is fired when a player presses the stats button from the game 3 page.
            continueGame: this event is fired when a player presses the continue button from the welcome page.
            playNextGame: this event is fired when a player presses the play next button after completing a game.
        These events fire at the start and end of the puzzle.
            onGameStart: fires when the first game is started in the puzzle
            onFirstCompletion: fires when the player finished the third game of the puzzle

Testing:

Questions:
