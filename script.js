/**
 * ICS4U - Final Project
 *
 * Description:
 *
 * Author: Addie de Boer
 */

'use strict';


const CVS_WIDTH = 660;
const CVS_HEIGHT = 300;
const ROWS = 10;
const COLS = 22; // the two grids are the same grid, they are separated by a 2 tile wide gap of nothing tiles

const X = CVS_WIDTH / COLS;
const Y = CVS_HEIGHT / ROWS;

// values for targeting / placing ships on coordinates
let tgt_x = 0;
let tgt_y = 0;
let tgt_r = -1; // toggles between 1 and -1

let loc_cvs;
let tgt_cvs;

// let tempShip = [[0,0],[0,1],[0,2]];
let a_s = 0; // short for activeShip, changed to a_s because activeShip was a bunch of characters and made the code minimally harder for me to read

let loc_p1_grid = [];
let loc_p2_grid = [];
let prevActive = [0,0];


let player_1;
let player_2;


// booleans

let shellFired = false;
let turn = 1; // between 1 and -1
let placeShips = true;




// classes


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
  };
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
      this.#ships[0] = new Ship(5, "ac", "USS Yorktown")
      this.#ships[1] = new Ship(4, "bt", "USS Missouri")
      this.#ships[2] = new Ship(3, "ds", "USS Isherwood")
      this.#ships[3] = new Ship(3, "sb", "USS Barracuda")
      this.#ships[4] = new Ship(2, "pt", "USS Barfly")
    } else {
      // player 2 plays as Imperial Japan
      this.#ships[0] = new Ship(5, "ac", "IJN Akagi")
      this.#ships[1] = new Ship(4, "bt", "IJN Yamato")
      this.#ships[2] = new Ship(3, "ds", "IJN Yukikaze")
      this.#ships[3] = new Ship(3, "sb", "IJN Kaidai")
      this.#ships[4] = new Ship(2, "pt", "IJN Ryuuho")
    }


  }

  get username() {return this.#username}
  set username(item) {this.#username = item}

  set setPassword(item) {this.#password = item}
  get ships() {return this.#ships}
}



class Ship {
  #type = "" // type of ship, used for text alert when the ship has been destroyed
  #seaworthy = true; // if ship is still alive
  #coords = []; // coordinates for each section of the ship
  #name; // name of ship, used for text alert when the ship has been destroyed
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
  }
}



class Compartment {
  #coords; // coordinates of compartment on grid
  bingus = "bingus" // bingus
  #damaged = false; // boolean if the compartment has recieved a hit

  constructor(coords) {
    this.#coords = coords
  }

  get damaged() {return this.#damaged}
  set damaged(item) {this.#damaged = item}
}






// functions





function setup() {
  loc_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  // tgt_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);

  // loc_cvs.parent("loc_cvs_div");
  // tgt_cvs.parent("tgt_cvs_div");
  loc_cvs.position(10,10, "static");

  // tgt_p1_grid.position(400,400);
  // Initialize the grid to all white squares
  grid_gen(loc_p1_grid);
  grid_gen(loc_p2_grid);
  // grid_gen(tgt_p1_grid)


  initGame();
}




function draw() {

  // frames++;
  // if (frames > 20) {frames = 1; console.log(": seconds")}
  if (turn == 1) {
    draw_grid(loc_p1_grid, COLS, ROWS);
  } else if (turn == -1) {
    draw_grid(loc_p2_grid, COLS, ROWS);

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

5
  cursor(ARROW);

  for (let row = 0; row < y; row++) {
    for (let col = 0; col < x; col++) {
      if (grid[row][col].colour == "gray") {
        noStroke();
      } else {stroke([5,51,128])}
      if (col == 10 || col == 11) {
        noStroke();
        grid[row][col].colour = "white"
      }
       if (activeX < COLS && activeY < ROWS && activeX > 11) {
      // grid[activeY][activeX]
      // stroke("green")

      cursor(CROSS)
    }
      // Fill the square with the r,g,b values from the model
      fill(grid[row][col].colour);
      rect(col*width + x_buffer, row*height + y_buffer, width, height);
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
}



function changeTurn() {
  turn *= -1;
  shellFired = false;
  // do some shtuff to hide the current screen, then ask for the other user's password, then reveal screen
  if (turn == 1) {
    draw_grid(loc_p1_grid);
    loc_p1_grid[prevActive[0]][prevActive[1]].resetColour();
  } else {
    draw_grid(loc_p2_grid);
    loc_p2_grid[prevActive[0]][prevActive[1]].resetColour();
  }
  console.log("turn changed: "+turn);
}







function initGame() {
  player_1 = new Player(1);
  player_2 = new Player(-1);

  player_1.username = "USN";
  player_2.username = "IJN";


  // drawShip(player_1.ships[a_s].loc);

  // shipPlacement(player_1);w
  // shipPlacement(player_2);
}


function drawShip(grid, ship) {
  // console.log(ship);
  for (let i = 0; i < ship.length; i++) {
    grid[ship[i][0]][ship[i][1]].colour = "gray";
  }
}

function placeShip(gridP1, gridP2, ship) {
  // a_s defining which ship is being placed currently
  a_s++;
  for (let i = 0; i < ship.length; i++) {
    gridP1[ship[i][0]][ship[i][1]].hasShip = true;
    gridP2[ship[i][0]][ship[i][1]+12].hasShip = true;
  }

  if (a_s > 4) {
    a_s = 0;
    if (turn == -1) {placeShips = false}
    changeTurn();
  }
}





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




function placing_ships(player, grid, keyCode) {

  let shpLng = player.ships[a_s].loc.length;

  if (keyCode ===  98 || keyCode === 83 || keyCode === 40) {
    // console.log("DOWN")
    if ((tgt_r == 1 && tgt_y+shpLng<10) || (tgt_r != 1 && tgt_y<9)) {
      tgt_y++
      moveShip(grid, player, shpLng, 0, 1);
    } else {return -1}
  } // up     // W, NUMPAD_8, UP_ARROW

  if (keyCode === 100 || keyCode === 65 || keyCode === 37) {
    // console.log("LEFT")
    if ((tgt_x>0)) {
      tgt_x--
      moveShip(grid, player, shpLng, 1, -1);
    } else {return -1}

  } // left   // A, NUMPAD_4, LEFT_ARROW

  if (keyCode === 102 || keyCode === 68 || keyCode === 39) {
    // console.log("RIGHT")
    if ((tgt_r == -1 && tgt_x+shpLng<10) || (tgt_r != -1 && tgt_x<9)) {
      tgt_x++
      moveShip(grid, player, shpLng, 1, 1);
    } else {return -1}

  } // right  // D, NUMPAD_6, RIGHT_ARROW

  if (keyCode === 104 || keyCode === 87 || keyCode === 38) {
    // console.log("UP")
    if ((tgt_y>0)) {
      tgt_y-- // not sure i actually need this but i kinda like it so i'm keeping it
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
    console.log("CONFIRM")
    for (let i = 0; i < shpLng; i++) {
      if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
        console.log("COLLISION DETECTED");
        return -1;
      } // prevents two ships from occupying the same coordinate
    }
    console.log("SHIP PLACED")


    tgt_r = -1;
    tgt_x = 0;
    tgt_y = 0;

    if (turn == 1) {
      placeShip(loc_p1_grid, loc_p2_grid, player.ships[a_s].loc);
      drawShip(loc_p1_grid, player_1.ships[a_s].loc)
    }
    else {
      placeShip(loc_p2_grid, loc_p1_grid, player.ships[a_s].loc)
      drawShip(loc_p2_grid, player_2.ships[a_s].loc)
    }
  } // confirm // SPACE, ENTER, NUMPAD_ENTER
}


function drawNewShip(grid, player, i) {
  if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
    grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = [151,95,150];
  } else {
    grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = ["gray"];
  }
}


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



function rotateShip(grid, player, shpLng, p) {
  for (let i = 0; i < shpLng; i++) {
    grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
    player.ships[a_s].loc[i][0] = player.ships[a_s].loc[i][0]+(p*i)
    player.ships[a_s].loc[i][1] = player.ships[a_s].loc[i][1]-(p*i)
    // console.log(player.ships[a_s].loc[i][0], player.ships[a_s].loc[i][1])

  }

  if (canRotate(player.ships[a_s].loc) == false) {
    tgt_r *= -1;
    for (let k = 0; k < shpLng; k++) {
      player.ships[a_s].loc[k][0] = player.ships[a_s].loc[k][0]+(p*k)
      player.ships[a_s].loc[k][1] = player.ships[a_s].loc[k][1]-(p*k)
      grid[player.ships[a_s].loc[k][0]][player.ships[a_s].loc[k][1]].colour = "gray";
    }
  }
}




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
        if (player.ships[q].stillAlive() == false) {player.ships_left--}
        console.log(player.ships[q].loc[r]);
        console.log(player.ships_left);
        return;
      }
    } // finds which part of which ship was hit, then lets the ship know it was shot there
  }

}


function fireAtCoords(grid_p1, grid_p2, p1, p2, y, x) {
  if (shellFired) {return -1} // checking if the player has already shot this turn
  if (x <= 11) {return -1} // checking if the mouse was clicked on the targeting grid
  if (grid_p1[y][x].beenHit) {return -1} // checking if the tile was already shot at
  // console.log("SHELL FIRED");
  shellFired = true;
  grid_p1[y][x].beenHit = true;
  grid_p2[y][x-12].beenHit = true;
  hitShip(p2, [y,x-12]);
  p1.shots_fired++;
  // console.log(loc_p1_grid[y][x], y, x)
  grid_p1[y][x].resetColour();

  if (grid_p1[y][x].hasShip == true) {
    // console.log("HIT");
    // grid_p1[y][x].colour = "red";
  } else {
    // console.log("MISS");
    // grid_p1[y][x].colour = "white";
  }

  // wait for a few seconds before switching turn
  // setTimeout(changeTurn(), 5000); // doesn't want to work, not sure why and i'm pretty sure i'm using it correctly so i'm just not gonna use it
  // changeTurn();

}

///////////////////////////////////////////   Event Functions   ///////////////////////////////////////////



function keyPressed() {
  // console.log(player_1.ships[a_s].length)

  // console.log(player.ships[a_s].loc);
  // i'm very confident that this is actually very bad practice and probably brings a lot of issues with it
  // but i don't know how else to pass player_1 or player_2 to this function when it's their turn and this seems to work entirely because JS copies by reference instead of value
  // i genuinely never thought my life would actually be easier because of something i despise so much

  if (placeShips) {

    if (turn == 1) {
      placing_ships(player_1, loc_p1_grid, keyCode)
    } else if (turn == -1){
      placing_ships(player_2, loc_p2_grid, keyCode)
    }

  }

  // /*
  if (keyCode === 16 || keyCode === 18) {
    changeTurn();
  } // just for testing so i can hotswap player turns
  // */
}


function mousePressed(event) {
  if (placeShips == true) {return -1} // returns if ships are being placed, prevents shooting while moving into position

  let tileX = CVS_WIDTH / COLS;
  let tileY = CVS_HEIGHT / ROWS;
  let activeX = (mouseX - (mouseX % tileX)) / tileX;
  let activeY = (mouseY - (mouseY % tileY)) / tileY;
  // i have this code up in draw_grid so i could probably just make a helper function so i dont need the code twice but whatever lol

  if (turn == 1) {
    if (event.button === 2 && activeX > 11) {
      markTile(loc_p1_grid, activeY, activeX);
    } else if (event.button === 0) {
      fireAtCoords(loc_p1_grid, loc_p2_grid, player_1, player_2, activeY, activeX);
    // console.log("shoot:", activeY, activeX);
    }

  } else if (turn == -1) {
    if (event.button === 2 && activeX > 11) {
      markTile(loc_p2_grid, activeY, activeX);
    } else if (event.button === 0) {
      fireAtCoords(loc_p2_grid, loc_p1_grid, player_2, player_1, activeY, activeX);
    // console.log("shoot:", activeY, activeX);
    }

  }

}





// function log(str) {
//   document.getElementById("debug").innerHTML += "<br>" + str.toString();
// } // not working, don't know why, not gonna fix
