/**
 * ICS4U - Final Project
 *
 * Description:
 *
 * Author: Addie de Boer
 */

'use strict';





///////////////////////////////////////////   constants   ///////////////////////////////////////////



const SCR_WIDTH = Math.round(innerWidth / 100 * 80);
const CVS_WIDTH = SCR_WIDTH;
const CVS_HEIGHT = SCR_WIDTH / 2.2;
// makes grid same size as screen for pwetty
const ROWS = 10;
const COLS = 22; // the two grids are the same grid, they are separated by a 2 tile wide gap of nothing tiles

const X = CVS_WIDTH / COLS;
const Y = CVS_HEIGHT / ROWS;





///////////////////////////////////////////   variables   ///////////////////////////////////////////






// values for targeting / placing ships on coordinates
let tgt_x = 0; // stores x value of current ship bow
let tgt_y = 0; // stores y value of current ship bow
let tgt_r = -1; // toggles between 1 and -1, stores rotation of current ship

let tgt_cvs; // main canvas

// let tempShip = [[0,0],[0,1],[0,2]];
let a_s = 0; // short for activeShip, changed to a_s because activeShip was a bunch of characters and made the code minimally harder for me to read

let tgt_p1_grid = []; // grid for player 1
let tgt_p2_grid = []; // grid for player 2
let prevActive = [0,0]; // previous active tile, used for highlighting ability on targeting grid
let coords_tgt = [0,0];

let player_1;
let player_2;

let grid_div = document.getElementById("tgt_cvs_div"); // container for canvas
let pswd_div = document.getElementById("password_div"); // container for password box
let dmg_rpt = document.getElementById("damage_report"); // text for alerts when you're shot somewhere
let srk_rpt = document.getElementById("strike_report"); // text for alerts when you've sunk a ship
let cic_dmg_rpt = document.getElementById("cic_damage_report"); // container for dmg_rpt
let cic_srk_rpt = document.getElementById("cic_strike_report"); // container for srk_rpt



///////////////////////////////////////////   booleans   ///////////////////////////////////////////





let shellFired = false;
let recentlyHit = false; // prevents damage report from unnecessarily appearing
let turn = 1; // between 1 and -1
let placeShips = true; // prevents ships from being moved when the initial two turns are over
let playerSetup = true; // prevents ships from being moved before the players have usernames and passwords
let betweenTurns = false; // prevents accidental clicks during turn change
let gaming = true;




///////////////////////////////////////////   classes / objects   ///////////////////////////////////////////


class Tile {
  colour = [0, 0, 0];
  #trueColour;
  #hasShip = false;
  #beenHit = false;
  #isTGT;

  constructor(colour, isTGT) {
    this.colour = colour;
    this.#trueColour = colour;
    this.#isTGT = isTGT;
  }

  get trueColour() {return this.#trueColour}
  get hasShip() {return this.#hasShip};
  get beenHit() {return this.#beenHit};

  set hasShip(item) {
    this.#hasShip = item;
    if (this.#isTGT == false) {
      this.#trueColour = "gray";
    }
  }

  set beenHit(item) {
    this.#beenHit = item;
    if (this.#hasShip == true) {
      this.#trueColour = "red"
    } else {
      this.#trueColour = "white"
    }
  }

  resetColour() {
    this.colour = this.#trueColour;
  }

  setEmpty(item) {this.#trueColour = [0,0,0,0]}
}



class Player {
  #username = "";
  #position;
  hits = 0;
  ships_left = 5;
  shots_fired = 0;
  #password = "";

  #ships = [];


  constructor(position) {
    this.#position = position;

    // ship initialisation
    if (position == 1) {
      // player 1 plays as USA
      this.#username = "United States Navy"
      this.#ships[0] = new Ship(5, "aircraft carrier", "USS Yorktown")
      this.#ships[1] = new Ship(4, "battleship", "USS Missouri")
      this.#ships[2] = new Ship(3, "destroyer", "USS Isherwood")
      this.#ships[3] = new Ship(3, "submarine", "USS Barracuda")
      this.#ships[4] = new Ship(2, "patrol boat", "USS Barfly")
    } else {
      // player 2 plays as Imperial Japan
      this.#username = "Imperial Japanese Navy"
      this.#ships[0] = new Ship(5, "aircraft carrier", "IJN Akagi")
      this.#ships[1] = new Ship(4, "battleship", "IJN Yamato")
      this.#ships[2] = new Ship(3, "destroyer", "IJN Yukikaze")
      this.#ships[3] = new Ship(3, "submarine", "IJN Kaidai")
      this.#ships[4] = new Ship(2, "patrol boat", "IJN Ryuuho")
    }


  }

  get ships() {return this.#ships}
  get username() {return this.#username}

  set username(item) {this.#username = item}
  set password(item) {this.#password = item}

  passwordChecker(pswd) {return pswd == this.#password}
}



class Ship {
  #type = "" // type of ship, used for text alert when the ship has been destroyed
  #seaworthy = true; // if ship is still alive
  #coords = []; // coordinates for each section of the ship
  #name; // name of ship, used for text alert when the ship has been destroyed
  bingus = "bingus"; // bingus // bingus used to live in the Compartment object but i didnt need that so he's moved here
  // #coordinates;
  #rotation;

  constructor(length, type, name, rotation) {
    this.#type = type;
    this.#name = name;
    for (let a = 0; a < length; a++) {
      this.#coords.push([0,a,false])
    }
    // this.#coordinates = coordinates;
    this.#rotation = rotation;
  }


  get name() {return this.#name}
  get loc() {return this.#coords} // loc short for location
  // get coordinates() {return this.#coordinates}
  get type() {return this.#type}

  // set coordinates(item) {this.#coordinates = item}
  set rotation(item) {this.#rotation = item}

  get seaworthy() {return this.#seaworthy}
  set seaworthy(item) {this.#seaworthy = item}

  stillAlive() {
    for (let l = 0; l < this.#coords.length; l++) {
      if (this.#coords[l][2] == false) {
        return true;
      }
    }
    this.#seaworthy = false;
    return false;
  } // checks if the ship is still alive
}






///////////////////////////////////////////   functions   ///////////////////////////////////////////





///////////////////////////////////////////   game setup   ///////////////////////////////////////////





function setup() {
  tgt_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);

  tgt_cvs.parent("tgt_cvs_div");
  tgt_cvs.position(10,10, "static");

  grid_gen(tgt_p1_grid);
  grid_gen(tgt_p2_grid);


  initGame();
}



function draw() {

  // frames++;
  // if (frames > 60) {frames = 1; console.log(": seconds")}
  // above was an ineffective attempt to make an accurate timing system, but the 60fps isnt a constant so it doesn't actually count correctly
  if (turn == 1) {
    draw_grid(tgt_p1_grid, COLS, ROWS);
  } else if (turn == -1) {
    draw_grid(tgt_p2_grid, COLS, ROWS);

  }

}



function draw_grid(grid, x, y) {
  let width = Math.floor(CVS_WIDTH/x);
  let height = Math.floor(CVS_HEIGHT/y);

  let x_buffer = (CVS_WIDTH - width*x)/2
  let y_buffer = (CVS_HEIGHT - height*y)/2

  let tileX = CVS_WIDTH / COLS;
  let tileY = CVS_HEIGHT / ROWS;
  let activeX = (mouseX - (mouseX % tileX)) / tileX;
  let activeY = (mouseY - (mouseY % tileY)) / tileY;


  cursor(ARROW);

  for (let row = 0; row < y; row++) {
    for (let col = 0; col < x; col++) {
      if (grid[row][col].colour == "gray") {
        noStroke();
      } else {stroke([5,51,128])}
      if (col == 10 || col == 11) {
        noStroke();
        grid[row][col].colour = "white";
      }
       if (activeX < COLS && activeY < ROWS && activeX > 11) {
      // grid[activeY][activeX];
      // stroke("green");

      cursor(CROSS)
    }
      // Fill the square with the r,g,b values from the model
      fill(grid[row][col].colour);
      rect(col*width + x_buffer, row*height + y_buffer, width, height);
      if (grid[row][col].beenHit == true) {
        grid[row][col].resetColour();
        // reset to default colours if all ships have been placed
        // allows shots to show up when drawing the player side of the grid
      }
    }




  }





}



function grid_gen(grid) {
  let tgt_coord;
  for (let y = 0; y < ROWS; y++) {
    grid[y] = [];
    tgt_coord = false;
    for (let x = 0; x < COLS; x++) {
      if (x > 11) {
        tgt_coord = true;
      }
      if ((x+y) % 2 == 0) {
        // grid[y].push(new Tile([0, 60, 120]));
        grid[y].push(new Tile([0, 120, 230], tgt_coord));
      } else {
        // grid[y].push(new Tile([0,65,120]));
        grid[y].push(new Tile([0, 130, 230], tgt_coord));
      }

    }
  }
  return grid;
} // i make-a da pizza(grid)



function initGame() {
  player_1 = new Player(1);
  player_2 = new Player(-1);

}



function rulesButton() {
  if(document.getElementById("rulesWindow").style.display == "none") {
    document.getElementById("rulesWindow").style.display = "inline-block"
  } else {
    document.getElementById("rulesWindow").style.display = "none"
  }
} // toggle to show the quick rules summary on and off





///////////////////////////////////////////   turn swapping   ///////////////////////////////////////////





function playerCreation() {
  turn *=-1

  if (turn == -1) { // -1 instead of 1 because i changed the turn before doing action so technically it's still player 1's turn
    if (document.getElementById("user_box").value != ""){
      player_1.username = document.getElementById("user_box").value
    } // if no username is given, username defaults to the name of the navy the player plays as
    player_1.password = document.getElementById("pswd_box").value

    document.getElementById("user_box").value = ""
    document.getElementById("pswd_box").value = ""

    document.getElementById("turn").innerHTML = "Player 2, enter a username and password."
  } else {
    if (document.getElementById("user_box").value != ""){
      player_2.username = document.getElementById("user_box").value
    }
    player_2.password = document.getElementById("pswd_box").value

    document.getElementById("user_box").value = ""
    document.getElementById("pswd_box").value = ""

    document.getElementById("turn").innerHTML = player_1.username+"'s turn"

    document.getElementById("chgTrnBtn").style.display = "block"
    document.getElementById("player_init").style.display = "none"

    grid_div.style.display = "block"

    playerSetup = false;
  }

} // changes elements at the beginning of gameplay for setup



function finishTurn() {
  // begins changing turn sequence
  betweenTurns = true;
  if (shellFired == false && placeShips == false) {return -1}
  turn *= -1;
  shellFired = false;


  grid_div.style.display = "none";
  pswd_div.style.display = "block";
  cic_dmg_rpt.style.display = "none";
  cic_srk_rpt.style.display = "none";
  // resets all the displays to default

  if (turn == 1) {
    preparePlayer(player_1, tgt_p1_grid);
  } else {
    preparePlayer(player_2, tgt_p2_grid);
  }
  // console.log("turn changed: "+turn);
}



function preparePlayer(player, grid) {
  draw_grid(grid);
  grid[prevActive[0]][prevActive[1]].resetColour();
  document.getElementById("turn").innerHTML = player.username+"'s turn";
  pswdBoxTxt.innerHTML = player.username+", please enter your password to reveal your screen.";
  // redraws grid and updates text
}



function password(player) {
  let input_password = document.getElementById("password").value;

  if (turn == 1) {
    player = player_1;
  }
  if (turn == -1) {
    player = player_2;
  }

  if (player.passwordChecker(input_password) == true) {
    document.getElementById("password").value = "";
    // console.log("DING DING DING");
    betweenTurns = false;
    grid_div.style.display = "block";
    pswd_div.style.display = "none";
    if (placeShips == false && recentlyHit == true) {
      cic_dmg_rpt.style.display = "inline-block";
      recentlyHit = false;
    }
  }
} // checks password when input box is confirmed



function close_cic_rpt() {
  cic_dmg_rpt.style.display = "none";
  cic_srk_rpt.style.display = "none";
} // closes cic reports, as name says



function drawShip(grid, ship) {
  // console.log(ship);
  for (let i = 0; i < ship.length; i++) {
    grid[ship[i][0]][ship[i][1]].colour = "gray";
  }
}







///////////////////////////////////////////   error checking when placing ships   ///////////////////////////////////////////





function canRotate(coords) {
  for (let j = 0; j < coords.length; j++) {
    // console.log(coords[j])
    if (coords[j][0] < 0 || coords[j][1] < 0 || coords[j][0] > 9 || coords[j][1] > 9) {
      // let timer = 0;
      // let flashyInterval = setInterval(flashy(), 100);
      return false;
    }
  }
} // checks if the coordinates the ship is being rotated to are within the battlefield's borders



function flashy(coords, grid) {
  if (timer % 2 == 1) {
    for (let f = 0; f < coords.length; f++) {
      grid[coords[f][0]][coords[f][1]].colour = "red";
    }
  } else {
    for (let f = 0; f < coords.length; f++) {
      grid[coords[f][0]][coords[f][1]].resetColour();
    }
  }
  timer++;
  if (timer > 6) {clearInterval(flashyInterval())}
} // meant to be used to flash location when the ship can't go there, doesn't work at the moment





///////////////////////////////////////////   placing ships during game setup   ///////////////////////////////////////////





function placing_ships(player, grid, keyCode) {

  let shpLng = player.ships[a_s].loc.length;

  if (keyCode ===  98 || keyCode === 97 || keyCode === 99 || keyCode === 83 || keyCode === 40) {
    // console.log("DOWN")
    if ((tgt_r == 1 && tgt_y+shpLng<10) || (tgt_r != 1 && tgt_y<9)) {
      tgt_y++
      moveShip(grid, player, shpLng, 0, 1);
    } else {return -1}
  } // up     // W, NUMPAD_8, UP_ARROW

  if (keyCode === 100 || keyCode === 103 || keyCode === 97 || keyCode === 65 || keyCode === 37) {
    // console.log("LEFT")
    if ((tgt_x>0)) {
      tgt_x--
      moveShip(grid, player, shpLng, 1, -1);
    } else {return -1}

  } // left   // A, NUMPAD_4, LEFT_ARROW

  if (keyCode === 102 || keyCode === 105 || keyCode === 99 || keyCode === 68 || keyCode === 39) {
    // console.log("RIGHT")
    if ((tgt_r == -1 && tgt_x+shpLng<10) || (tgt_r != -1 && tgt_x<9)) {
      tgt_x++
      moveShip(grid, player, shpLng, 1, 1);
    } else {return -1}

  } // right  // D, NUMPAD_6, RIGHT_ARROW

  if (keyCode === 104 || keyCode === 103 || keyCode === 105 || keyCode === 87 || keyCode === 38) {
    // console.log("UP")
    if ((tgt_y>0)) {
      tgt_y-- // not sure i actually need this but i kinda like it so i'm keeping it
              // oh nevermind yes i do need it, this keeps the ships in the grid lmao
      moveShip(grid, player, shpLng, 0, -1);
    } else {return -1}

  } // down   // S, NUMPAD_2, DOWN_ARROW


  if (keyCode === 82  || keyCode === 107 || keyCode === 17) {
    // console.log("ROTATE_SHIP");
    // console.log(tgt_r);
    tgt_r *= -1;
    rotateShip(grid, player, shpLng, tgt_r);
    for (let i = 0; i < shpLng; i++) {
      drawNewShip(grid, player, i);
    }


  } // rotate  // R, NUMPAD_PLUS, CTRL


  if (keyCode === 32 || keyCode === 13) {
    // console.log("CONFIRM")
    for (let i = 0; i < shpLng; i++) {
      if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
        // console.log("COLLISION DETECTED");
        return -1;
      } // prevents two ships from occupying the same coordinate
    }
    // console.log("SHIP PLACED")

    // resets target coordinates to default values
    tgt_r = -1;
    tgt_x = 0;
    tgt_y = 0;

    if (turn == 1) {
      placeShip(tgt_p1_grid, tgt_p2_grid, player.ships[a_s].loc);
      drawShip(tgt_p1_grid, player_1.ships[a_s].loc)
    }
    else {
      placeShip(tgt_p2_grid, tgt_p1_grid, player.ships[a_s].loc)
      drawShip(tgt_p2_grid, player_2.ships[a_s].loc)
    }
  } // confirm // SPACE, ENTER, NUMPAD_ENTER
} // all the shtuff for the ship setup phase of the game



function moveShip(grid, player, shpLng, c,p) {
  // c is either 0 or 1 for the y or x
  // p is either 1 or -1 to move the ship that direction
  for (let i = 0; i < shpLng; i++) {
    grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
  } // clears old boat's place before drawing new boat

  for (let i = 0; i < shpLng; i++) {
    player.ships[a_s].loc[i][c]+=p;
    drawNewShip(grid, player, i);
  } // draws new boat after clearing old boat
}



function rotateShip(grid, player, shpLng) {
  for (let i = 0; i < shpLng; i++) {
    grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
    player.ships[a_s].loc[i][0] = player.ships[a_s].loc[i][0]+(tgt_r*i)
    player.ships[a_s].loc[i][1] = player.ships[a_s].loc[i][1]-(tgt_r*i)
    // console.log(player.ships[a_s].loc[i][0], player.ships[a_s].loc[i][1])

  }
  if (canRotate(player.ships[a_s].loc) == false) {
    tgt_r *= -1;
    for (let k = 0; k < shpLng; k++) {
      player.ships[a_s].loc[k][0] = player.ships[a_s].loc[k][0]+(tgt_r*k)
      player.ships[a_s].loc[k][1] = player.ships[a_s].loc[k][1]-(tgt_r*k)
      grid[player.ships[a_s].loc[k][0]][player.ships[a_s].loc[k][1]].colour = "gray";
    }

  }

}



function drawNewShip(grid, player, i) {
  if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
    grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = [151,95,150];
  } else {
    grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = ["gray"];
  }
}



function placeShip(gridP1, gridP2, ship) {
  // a_s defining which ship is being placed currently
  // console.log(placeShips, shellFired);
  a_s++;
  for (let i = 0; i < ship.length; i++) {
    gridP1[ship[i][0]][ship[i][1]].hasShip = true;
    gridP2[ship[i][0]][ship[i][1]+12].hasShip = true;
  }

  if (a_s > 4) {
    a_s = 0;
    finishTurn();
    if (turn == 1) {placeShips = false} // stops players from moving ships after the initial two turns are set up
  }
}





///////////////////////////////////////////   during main game   ///////////////////////////////////////////



function markTile(grid, y, x) {
  grid[prevActive[0]][prevActive[1]].resetColour();
  grid[y][x].colour = [128,80,190];
  prevActive = [y, x];
}


function hitShip(player, coords) {
  for (let q = 0; q < 5; q++) {
    // console.log(player.ships[q])
    for (let r = 0; r < player.ships[q].loc.length; r++) {
      // console.log(player.ships[q].loc, coords)
      if (player.ships[q].loc[r][0] == coords[0] && player.ships[q].loc[r][1] == coords[1]) {
        player.ships[q].loc[r][2] = true;
        player.hits++;
        recentlyHit = true;
        // console.log(player.ships[q].type, player.ships[q].name);
        dmg_rpt.innerHTML = "Damage control reports that our "+player.ships[q].type+", the "+player.ships[q].name+", was hit by enemy fire at coordinates "+ String.fromCharCode(coords_tgt[0]+65)+(coords_tgt[1]+1)+".";
        cic_dmg_rpt.style.display = "none"; // hopefully this prevents the damage report from showing up when you hit something, it should still show up when you're hit
        if (player.ships[q].stillAlive() == false) {
          shipDestroyed(player, q);

        }
        // console.log(player.ships[q].loc[r]);
        // console.log(player.ships_left);
        return;
      }
    } // finds which part of which ship was hit, then lets the ship know it was shot there
  }

}



function shipDestroyed(player, q) {
  dmg_rpt.innerHTML = "Damage control reports that our "+player.ships[q].type+", the "+player.ships[q].name+", has sunk from enemy fire at coordinates "+ String.fromCharCode(coords_tgt[0]+65)+(coords_tgt[1]+1)+".";
  srk_rpt.innerHTML = "Aerial reconnaissance reports that the "+player.ships[q].type+" "+player.ships[q].name+" has sunk at coordinates "+ String.fromCharCode(coords_tgt[0]+65)+(coords_tgt[1]+1)+"."
  cic_srk_rpt.style.display = "inline-block";
  player.ships_left--;
  // console.log("BANG");
  if (player.ships_left < 1) {
    gameOver(player, q);
  }
}



function fireAtCoords(grid_p1, grid_p2, p1, p2, y, x) {
  // console.log(gaming, betweenTurns, placeShips, shellFired, grid_p1[y][x].beenHit)
  if (gaming == false) {return -1} // checking if the game is over
  if (betweenTurns) {return -1} // checking if the player is allowed to shoot
  if (placeShips) {return -1} // checking if the ships are being placed
  if (shellFired) {return -1} // checking if the player has already shot this turn
  if (x <= 11) {return -1} // checking if the mouse was clicked on the targeting grid
  if (grid_p1[y][x].beenHit) {return -1} // checking if the tile was already shot at
  // yes there's a lot of error checking. my ships became sentient and started shooting at each other (clicks on buttons were registering on the targeting grid) so i had to put all these safeties in place to prevent an AI uprising
  p1.shots_fired++;
  // console.log("SHELL FIRED");
  shellFired = true;
  coords_tgt = [y,x-12];
  grid_p1[y][x].beenHit = true;
  grid_p2[y][x-12].beenHit = true;
  hitShip(p2, [y,x-12]);

  grid_p1[y][x].resetColour();

  if (grid_p1[y][x].hasShip == true) {
    // console.log("HIT");
  } else {
    // console.log("MISS");
  }
}





///////////////////////////////////////////   Game Over   ///////////////////////////////////////////





function gameOver(player, q) {
  // console.log(player.shots_fired, player.hits)
  // console.log("Game Over: "+player.username+" has won with "+player.shots_fired+" shells fired, and an accuracy of "+Math.round(player.hits / player.shots_fired)+"%.");
  gaming = false;
  document.getElementById("turn").innerHTML = "Game Over: "+player.username+" has won with "+player.shots_fired+" shells fired, and an accuracy of "+Math.round(player.hits / player.shots_fired*100)+"%."
  document.getElementById("chgTrnBtn").style.display = "none";
  document.getElementById("changeView").style.display = "block";
  srk_rpt.innerHTML = "With the destruction of the "+player.ships[q].type+" "+player.ships[q].name+", the last of "+player.username+"'s fleet has been destroyed, and you have claimed victory."
  dmg_rpt.innerHTML = "With the destruction of the "+player.ships[q].type+" "+player.ships[q].name+", the last of our fleet has been destroyed and we have lost the battle."
}



function swapScreen() {
  turn *= -1;
  grid_div.style.display = "block";
  pswd_div.style.display = "none";
  if (turn == 1) {
    draw_grid(tgt_p1_grid);
  } else if (turn == -1) {
    draw_grid(tgt_p2_grid);
  }
}





///////////////////////////////////////////   Event Functions   ///////////////////////////////////////////





function keyPressed() {
  // so much error checking (not really)
  if (gaming == false) {return -1}
  if (betweenTurns == true) {return -1}
  if (playerSetup == true) {return -1}
  if (placeShips) {

    if (turn == 1) {
      placing_ships(player_1, tgt_p1_grid, keyCode)
    } else if (turn == -1){
      placing_ships(player_2, tgt_p2_grid, keyCode)
    }

  } else {
    if (keyCode === 32 || keyCode === 13) {
      finishTurn();
    }
  }

  /*
  if (keyCode === 18) {
    finishTurn();
  } // lalt, maybe lshift i dont remember. just for testing so i can hotswap player turns
  */
}


function mousePressed(event) {
  if (gaming == false) {return -1} // checking if game is over
  if (placeShips == true) {return -1} // prevents shooting while moving into position

  let tileX = CVS_WIDTH / COLS;
  let tileY = CVS_HEIGHT / ROWS;
  let activeX = (mouseX - (mouseX % tileX)) / tileX;
  let activeY = (mouseY - (mouseY % tileY)) / tileY;
  // console.log(activeY, activeX)
  // i have this code up in draw_grid so i could probably just make a helper function so i dont need the code twice but whatever lol


  if (activeX > 11 && activeX < 22 && activeY >= 0 && activeY < 10) {
    if (turn == 1) {
      if (event.button === 2) {
        markTile(tgt_p1_grid, activeY, activeX);
      } else if (event.button === 0) {
        fireAtCoords(tgt_p1_grid, tgt_p2_grid, player_1, player_2, activeY, activeX);
        // console.log("shoot:", activeY, activeX);
      }

    } else if (turn == -1) {
      if (event.button === 2) {
        markTile(tgt_p2_grid, activeY, activeX);
      } else if (event.button === 0) {
        fireAtCoords(tgt_p2_grid, tgt_p1_grid, player_2, player_1, activeY, activeX);
        // console.log("shoot:", activeY, activeX);
      }

    }
  }
}





// function log(str) {
//   document.getElementById("debug").innerHTML += "<br>" + str.toString();
// } // not working, don't know why, probably cus i just copypasted it, not gonna fix
