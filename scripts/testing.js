function testGuess(guess, letters) {
    var points = calculatePointsForGuess(guess, letters)
    console.log("LETTERS: " + letters + " GUESS: " + guess + " PANAGRAM: " + (points > guess.length).toString() + " POINTS: " + points)
}

function testGuesses(letters, guesses) {
    guesses = guesses.split(",");
    guesses.forEach(guess => {
        testGuess(guess, letters)
    });
}

var guesses = "beer,beers,bees,beet,beetle,beetles,beetroot,beets,bell,belle,belles,bells,belt,belts,berber,beret,berets,beset,besets,besot,best,bests,bestseller,bestsellers,betel,bets,better,betters,bless,blesses,blob,blobs,blot,blots,blotter,bobble,bobbles,bobs,boer,boers,bole,bolero,bolster,bolsters,bolt,bolts,booboo,boor,boors,boos,boost,booster,boosters,boosts,boot,bootees,bootless,boots,bore,borer,borers,bores,boss,bosses,bottle,bottler,bottles,ebbs,eels,elbe,ells,else,eros,erose,error,errors,errs,erst,ester,esters,leer,leers,lees,less,lessee,lessees,lesser,lessor,lessors,lest,lets,letter,letters,lobe,lobes,lobs,lobster,lobsters,loess,loll,loose,looser,looses,loosest,loot,looter,looters,loots,lore,lose,loser,losers,loses,loss,losses,lost,lots,lotto,obese,oboe,oboes,obsess,obsesses,obsolete,orbs,ores,oslo,ostler,ostlers,otter,otters,rebel,rebels,reboot,reel,reels,resell,reseller,resellers,reset,resets,resettle,resort,resorts,rest,restless,restore,restorer,restorers,restores,rests,retell,retest,retests,retort,retorts,retro,robber,robbers,robe,robes,robot,robots,robs,roes,role,roles,roll,roller,rollers,rolls,roost,rooster,roosters,roosts,root,rootless,roots,rose,roses,rosette,rosettes,roster,rosters,rote,rotor,rotors,rots,rotter,seer,seers,sees,sell,seller,sellers,sells,sets,settee,settees,setter,setters,settle,settler,settlers,settles,setts,sleet,sleets,slob,slobber,slobbers,slobs,slot,slots,sober,soberer,sobers,sobs,sole,soler,soles,solo,soot,soots,sorbet,sorbets,sore,sores,sorrel,sort,sorter,sorters,sorts,soso,steel,steels,steer,steers,stereo,stereos,stet,stole,stool,stools,store,stores,street,streets,stress,stresses,stroll,stroller,strollers,strolls,tees,teeter,tell,teller,tellers,tells,terror,terrors,terse,terser,test,tester,testers,testes,tests,toeless,toes,toll,tolls,tool,tools,toot,tootle,tore,torso,torts,toss,tossers,tosses,tots,totter,totters,treble,trebles,tree,treeless,trees,tress,tresses,trestle,trestles,troll,trolls,trot,trots,trotter,trotters,tsetse"

//testGuesses("lobsrte", guesses)