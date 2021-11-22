Array.prototype.randomize = function () {
    //fisher yates from http://codereview.stackexchange.com/a/12200/3163
    var i = this.length;
    if (i === 0) return false;
    while (--i) {
        var j = Math.floor(Math.random() * (i + 1));
        var tempi = this[i];
        var tempj = this[j];
        this[i] = tempj;
        this[j] = tempi;
    }
};

Array.prototype.toObject = function () {
    var o = {};
    for (var i = 0; i < this.length; i++) {
        o[this[i]] = '';
    }
    return o;
};

function bindEvent(el, eventName, eventHandler) {
    if (el.addEventListener) {
        el.addEventListener(eventName, eventHandler, false);
    } else if (el.attachEvent) {
        el.attachEvent('on' + eventName, eventHandler);
    }
}

var Wheel = (function () {
    
    var wheel = document.getElementById('wheel'),
        wheelValues = [5000, 600, 500, 300, 500, 800, 550, 400, 300, 900, 500, 300, 900, 0, 600, 400, 300, -2, 800, 350, 450, 700, 300, 600],
        spinTimeout = false,
        spinModifier = function () {
            return Math.random() * 10 + 20;
        },
        modifier = spinModifier(),
        slowdownSpeed = 0.5,
        prefix = (function () {
            if (document.body.style.MozTransform !== undefined) {
                return "MozTransform";
            } else if (document.body.style.WebkitTransform !== undefined) {
                return "WebkitTransform";
            } else if (document.body.style.OTransform !== undefined) {
                return "OTransform";
            } else {
                return "";
            }
        }()),
        degreeToRadian = function (deg) {
            return deg / (Math.PI * 180);
        };

    function Wheel() {}

    Wheel.prototype.rotate = function (degrees) {
        var val = "rotate(-" + degrees + "deg)";
        if (wheel.style[prefix] !== undefined) wheel.style[prefix] = val;
        var rad = degreeToRadian(degrees % 360),
            filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=" + rad + ", M12=-" + rad + ", M21=" + rad + ", M22=" + rad + ")";
        if (wheel.style.filter !== undefined) wheel.style.filter = filter;
        wheel.setAttribute("data-rotation", degrees);        
    };
    
    Wheel.prototype.addEventListener = function(eventName, eventHandler) {
        wheel.addEventListener(eventName, eventHandler, false);
    }

    Wheel.prototype.spin = function (callback, amount) {
        document.getElementById("vowel").disabled=false;
        document.getElementById("solve").disabled=false;
        document.getElementById("newpuzzle").disabled=false;
        document.getElementById("vowel").style.backgroundImage = 'linear-gradient(to bottom, rgba(236, 130, 8, 0.938) 1%,rgba(175, 165, 22, 0.87) 100%)';
        document.getElementById("solve").style.backgroundImage = 'linear-gradient(to bottom, rgba(236, 130, 8, 0.938) 1%,rgba(175, 165, 22, 0.87) 100%)';
        document.getElementById("newpuzzle").style.backgroundImage = 'linear-gradient(to bottom, rgba(236, 130, 8, 0.938) 1%,rgba(175, 165, 22, 0.87) 100%)';

        var _this = this;
        clearTimeout(spinTimeout);
        modifier -= slowdownSpeed;
        if (amount === undefined) {
            amount = parseInt(wheel.getAttribute('data-rotation'), 10);
        }
        this.rotate(amount);
        if (modifier > 0) {

            spinTimeout = setTimeout(function () {
                _this.spin(callback, amount + modifier);
            }, 1000 / 5);
        } else {
            var dataRotation = parseInt(wheel.getAttribute('data-rotation'), 10);
            modifier = spinModifier();
            var divider = 360 / wheelValues.length;
            var offset = divider / 2; //half division
            var wheelValue = wheelValues[Math.floor(Math.ceil((dataRotation + offset) % 360) / divider)];
            switch (wheelValue) {
                case 0:
                    return callback(0);
                case -1:
                    return callback("Free Spin");
                case -2:
                    return callback("Lose a turn");
                default:
                    return callback(wheelValue);
            }
        }
    };

    return Wheel;
})();

var WheelGame = (function () {

    var level = 1;



    var counter = 1;
    var player1Bal=0;
    var player2Bal=0;
    var player3Bal=0;
    var allText="LeaderBoard "
    var textarea="Letters chosen:" + "\n"; 
    var alphabetArr = [];
    var myTimer = 0;
    var clock =0;
    var wheel = new Wheel(),
        vowels = ['A', 'E', 'I', 'O', 'U'],
        spinWheel = document.getElementById('spin'),
        buyVowel = document.getElementById('vowel'),
        displayArea = document.getElementById('display'),
        newButton = document.getElementById('newpuzzle'),
        money = document.getElementById('money'),
        solve = document.getElementById('solve');
        document.getElementById("tick").position="relative";


    function WheelGame(puzzles) {
        var _this = this;
        this.puzzles = puzzles;
        this.puzzles.randomize();
        this.currentMoney = 0;
        this.puzzleSolved = false;
        

        bindEvent(buyVowel, "click", function () {
            if (parseFloat(document.getElementById('money'+ counter).innerHTML) > 200) {
                if (_this.createGuessPrompt("PLEASE ENTER A VOWEL", true) !== false) {
                    document.getElementById('money'+ counter).innerHTML =  parseFloat(document.getElementById('money'+ counter).innerHTML) - 200;
                    _this.updateMoney();
                }
            } else {
                alert("You need more than $200 to buy a vowel");
                alert(money.innerHTML);
            }
        });
        bindEvent(newButton, "click", function () {
            _this.newRound();
        });
        var spinTheWheel = function () {
            document.getElementById('tick').style.animation = "ticks 1s 1s infinite";
            _this.timerCountdown();
            wheel.spin(function (valueSpun) {
                
                if (isNaN(valueSpun)) {
                    alert(valueSpun);
                } else {
                    //is a valid number
                    if (valueSpun === 0) {
                        alert('Bankrupt!');
                        _this.currentMoney = 0;
                    } else {
                        //spun greater than 0
                        var amountFound = _this.createGuessPrompt(valueSpun);
                        _this.currentMoney += (valueSpun * amountFound);
                    }
                    
                    
                    
                }
                _this.changeTurn();
                _this.updateMoney();
                
            });
        };
        bindEvent(spinWheel, "click", spinTheWheel);
        bindEvent(wheel, "click", spinTheWheel);

        function arrays_equal(a, b) {
            return !(a < b || b < a);
        }
        
        bindEvent(solve, "click", function () {
            if (!_this.puzzleSolved) {
                var solve = prompt("Solve the puzzle?", "");
                if (solve) {
                    guess = solve.toUpperCase().split("");
                    if (arrays_equal(guess, _this.currentPuzzleArray)) {
                        for (var i = 0; i < guess.length; ++i) {
                            _this.guessLetter(guess[i], false, true);
                        }
                    }
                    if (!_this.puzzleSolved) {
                        alert('PUZZLE NOT SOLVED');
                    }
                }
            }
        });
        this.startRound(0); //start the 1st round
    }


    WheelGame.prototype.changeTurn = function (){
        if(counter == 1){
            //we change the selected box to the corresponding counter
            money = document.getElementById('money');
            document.getElementById("moneyArea").style.borderColor="white";
            document.getElementById("moneyArea2").style.borderColor="yellow";
            document.getElementById("moneyArea3").style.borderColor="white";
            counter=2;
        }else if(counter ==2){
            money = document.getElementById('money2');
            document.getElementById("moneyArea").style.borderColor="white";
            document.getElementById("moneyArea2").style.borderColor="white";
            document.getElementById("moneyArea3").style.borderColor="yellow";
            counter=3;
        }else if(counter ==3){
            money = document.getElementById('money3');
            document.getElementById("moneyArea").style.borderColor="yellow";
            document.getElementById("moneyArea2").style.borderColor="white";
            document.getElementById("moneyArea3").style.borderColor="white";
            counter =1;

        }
       
        
    };
    WheelGame.prototype.updateMoney = function () {
        money.innerHTML = parseFloat(money.innerHTML)+ this.currentMoney;
        player1Bal = parseFloat(document.getElementById('money').innerHTML);
        player2Bal = parseFloat(document.getElementById('money2').innerHTML);
        player3Bal = parseFloat(document.getElementById('money3').innerHTML);
        this.currentMoney = 0;
    };
    WheelGame.prototype.timerCountdown = function (){
        if(myTimer == 0){
            myTimer =1;
            clock = setInterval(myClock, 1000);
            var c = 60
            function myClock(){
                document.getElementById("displaytimer").innerHTML = --c;
                if(c == 0){
                    clearInterval(clock);
                    alert("Reached zero");
            }
        }

    };

}


  

    WheelGame.prototype.guessLetter = function (guess, isVowel, solvingPuzzle) {
        var incorrect=0;
        var timesFound = 0;
        
        solvingPuzzle = solvingPuzzle === undefined ? false : true;
        //find it:
        if (guess.length && !this.puzzleSolved) {
            if (!solvingPuzzle && !isVowel && (guess in vowels.toObject())) {
                alert("Cannot guess a vowel right now!");
                return false;
            }
            if (!solvingPuzzle && isVowel && !(guess in vowels.toObject())) {
                alert("Cannot guess a consanant right now!");
                return false;
            }
            for (var i = 0; i < this.currentPuzzleArray.length; ++i) {
                if (guess == this.currentPuzzleArray[i]) {
                    var span = document.getElementById("letter" + i);
                    if (span.innerHTML != guess) {
                        //found it
                        ++timesFound;
                    }
                    span.innerHTML = guess;
                    if (guess in this.lettersInPuzzle.toObject() && !(guess in this.guessedArray.toObject())) {
                        this.guessedArray.push(guess);
                        
                    }
                }else{
                    incorrect++;
                    //IF THE GUESS IS INCCORECT, THEN THE VARIABLE INCORRECT WILL BE INCREMENTED
                    clearInterval(clock);
                    document.getElementById("displaytimer").innerHTML = "60";
                }
            }
            if(incorrect>0){
                //if the guess is incorrect then the variable inccorrect is changed back to 0
               
                incorrect=0;
            }
            /*

            FOR LOOP TO CHECK IF THE LETTER WAS ALREADY TYPED
            for(var i = 0; i<alphabetArr.length();i++){
                if(guess!=alphabetArr[i]){
                    alphabetArr[i].push(guess);
                }
            }
            */
            
            textarea+=""+guess+"  ";
            document.getElementById("anything").innerHTML= textarea;
            

            if (this.guessedArray.length == this.lettersInPuzzle.length) {
                alert("PUZZLE SOLVED!");
                var currentTime = new Date();
                var concatTime = currentTime.getHours() + ":"+currentTime.getMinutes();
                if(player1Bal>player2Bal && player1Bal>player2Bal){
                    alert("PLAYER 1 HAS WON");
                    document.getElementById("displayInfoAlert").innerHTML = "Player 1 is the lastest winner with a balance of " + player1Bal + " !";
                    allText+="\nPlayer 1 has won with "+ player1Bal + " \nat " + concatTime;

                } else if(player1Bal<player2Bal && player3Bal<player2Bal){
                    alert("PLAYER 2 HAS WON");
                    document.getElementById("displayInfoAlert").innerHTML = "Player 2 is the lastest winner with a balance of " + player2Bal + " !";
                    allText+="\n\nPlayer 2 has won with "+ player2Bal + " \nat " + concatTime;
                }else if(player1Bal<player3Bal && player2Bal>player3Bal){
                    alert("PLAYER 3 HAS WON")
                    document.getElementById("displayInfoAlert").innerHTML = "Player 3 is the lastest winner with a balance of " + player3Bal + " !";
                    allText+="\n\nPlayer 3 has won with "+ player3Bal + " \nat " + concatTime;
                }
                document.getElementById("leaderboardtext").innerHTML = allText;
                this.puzzleSolved = true;
            }

            return timesFound;
        }
        return false;

    };

    var guessTimes = 0;
    WheelGame.prototype.createGuessPrompt = function (valueSpun, isVowel) {
        isVowel = isVowel === undefined ? false : true;
        if (!this.puzzleSolved) {
            var letter;
            if (isVowel) {
                letter = prompt("PLEASE ENTER A VOWEL", "");
            } else {
                letter = prompt("YOU SPUN A " + valueSpun + " PLEASE ENTER A CONSONANT", "");
            }
            if (letter) {
                var guess = letter.toUpperCase().charAt(0);
                var timesFound = this.guessLetter(guess, isVowel);
                if (timesFound === false) {
                    
                    ++guessTimes;
                    if (guessTimes < 5) {
                        return this.createGuessPrompt(valueSpun, isVowel);
                    }
                }
                guessTimes = 0;
                return timesFound;
            } else {
                ++guessTimes;
                
                if (guessTimes < 5) {
                    return this.createGuessPrompt(valueSpun, isVowel);
                }
                else {
                    // reset guessTimes
                    guessTimes = 0;
                }
            }
        }
        return false;
    };

    WheelGame.prototype.newRound = function () {
        if(level <4){
            document.getElementById('displaylevel').innerHTML= "Level " + level;
            var round = ++this.round;
            if (round < this.puzzles.length) {
                while (displayArea.hasChildNodes()) { //remove old puzzle
                    displayArea.removeChild(displayArea.firstChild);
                    document.getElementById('money').innerHTML = 0;
                    document.getElementById('money2').innerHTML = 0;
                    document.getElementById('money3').innerHTML = 0;
                    money = document.getElementById('money');
                    document.getElementById("moneyArea").style.borderColor="yellow";
                    document.getElementById("moneyArea2").style.borderColor="white";
                    document.getElementById("moneyArea3").style.borderColor="white";
                    counter=1;
                    player1Bal=0;
                    player2Bal=0;
                    player3Bal=0;
                    textarea="Letters chosen:" + "\n"; 
                    document.getElementById("anything").innerHTML= textarea;
                }
                this.startRound(round);
                level++;
            } else {
                alert("No more puzzles!");
            }
        } else if(level = 4){
            alert("bonus ROUND");
            displayArea.removeChild(displayArea.firstChild);
            document.getElementById('display').style.borderColor="yellow";
            document.getElementById('money').innerHTML = 0;
            document.getElementById('money2').innerHTML = 0;
            document.getElementById('money3').innerHTML = 0;
            money = document.getElementById('money');
            document.getElementById("moneyArea").style.borderColor="yellow";
            document.getElementById("moneyArea2").style.borderColor="white";
            document.getElementById("moneyArea3").style.borderColor="white";
            counter=1;
            player1Bal=0;
            player2Bal=0;
            player3Bal=0;
            textarea="Letters chosen:" + "\n"; 
            document.getElementById("anything").innerHTML= textarea;

        }
       
    };

    WheelGame.prototype.startRound = function (round) {
        this.round = round;
        this.lettersInPuzzle = [];
        this.guessedArray = [];
        this.puzzleSolved = false;
        this.currentPuzzle = this.puzzles[this.round].toUpperCase();
        this.currentPuzzleArray = this.currentPuzzle.split("");
        var currentPuzzleArray = this.currentPuzzleArray;
        var lettersInPuzzle = this.lettersInPuzzle;
        var word = document.createElement('div');
        displayArea.appendChild(word);
        word.className = "word";
        for (var i = 0; i < currentPuzzleArray.length; ++i) {
            var span = document.createElement('div');
            span.className = "wordLetter ";

            if (currentPuzzleArray[i] != " ") {
                span.className += "letter";
                if (!(currentPuzzleArray[i] in lettersInPuzzle.toObject())) {
                    lettersInPuzzle.push(currentPuzzleArray[i]);
                }
                word.appendChild(span);
            } else {
                span.className += "space";
                word = document.createElement('div');
                displayArea.appendChild(word);
                word.className = "word";
                word.appendChild(span);
                word = document.createElement('div');
                displayArea.appendChild(word);
                word.className = "word";
            }

            span.id = "letter" + i;
        }

        var clear = document.createElement('div');
        displayArea.appendChild(clear);
        clear.className = "clear";
    };

    return WheelGame;
})();

var Game = new WheelGame([
     "app","jabree","Soupy Boys","Bird",
     "Lenovo", "Mark", "Matt", "Fries", "Blum", "Tenders",
     "Apple", "Spider Man", "iPhone", "Chicken", "Flask",
     "License", "Vigorous", "Spectrum", "Common", "preference",
     "compartment", "Valorant", "League of Legends", "Call of Duty", "WarZone",
     "Twitch", "YouTube", "Twitter", "JavaScript"
]);
///for instruction pop up upon clciking 
//////////////////
// Get the modal
var modal = document.getElementById("myModal");
// Get the image and insert it inside the modal - use its "alt" text as a caption
var img = document.getElementById("myImg");
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
img.onclick = function () {
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
}

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}




    //Start popup JS
    $(window).load(function () {
        $(".trigger_popup_fricc").click(function () {
            $('.hover_bkgr_fricc').show();
        });
        $('.hover_bkgr_fricc').click(function () {
            $('.hover_bkgr_fricc').hide();
        });
        $('.popupCloseButton').click(function () {
            $('.hover_bkgr_fricc').hide();
        });
    });
    //End popup JS

