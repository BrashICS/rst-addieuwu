/**
 * ICS4U - Final Project
 *
 * Description:
 *
 * Author: Addie de Boer
 */

'use strict';


const CVS_WIDTH = 300;
const CVS_HEIGHT = 630;
const ROWS = 21;
const COLS = 10;

const X = CVS_WIDTH / COLS;
const Y = CVS_HEIGHT / ROWS;

// values for targeting / placing ships on coordinates
let tgt_x = 0;
let tgt_y = 0;
let tgt_r = -1;

let loc_cvs;
let tgt_cvs;
// let tgt_p1_cvs;
// let tgt_p2_cvs;

let frames = 0; // used to count seconds, increases by 1 every time draw() runs and resets when it gets to 60

let tempShip = [[0,0],[0,1],[0,2]];

let loc_p1_grid = [];
let loc_p2_grid = [];

let player_1;
let player_2;


// booleans

let tempTurn = 1;
let prevActive = [0,0];

let turn = 1; // between 1 and -1
let placeShips = true;
let a_s = 0; // short for activeShip, changed to a_s because activeShip was a bunch of characters and made the code minimally harder for me to read




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
  #length = []; // length of ship
  #name; // name of ship, used for text alert when the ship has been destroyed
  // #coordinates;
  #rotation;

  constructor(length, type, name, rotation) {
    this.#type = type;
    this.#name = name;
    for (let a = 0; a < length; a++) {
      this.#length.push([0,a,false])
    }
    // this.#coordinates = coordinates;
    this.#rotation = rotation;
  }


  get name() {return this.#name}
  get loc() {return this.#length} // loc short for location
  // get coordinates() {return this.#coordinates}

  // set coordinates(item) {this.#coordinates = item}
  set rotation(item) {this.#rotation = item}

  get seaworthy() {return this.#seaworthy}
  set seaworthy(item) {this.#seaworthy = item}
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
      if (row == 10) {
        noStroke();
        grid[row][col].colour = "white"
      }
       if (activeX < COLS && activeY < ROWS && activeY > 10) {
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
  let tgt_coord = false;
  for (let y = 0; y < ROWS; y++) {
    grid[y] = [];
    if (y > 10) {
      tgt_coord = true;
    }
    for (let x = 0; x < COLS; x++) {

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
  // do some shtuff to hide the current screen, then ask for the other user's password, then reveal screen
  if (turn == 1) {
    draw_grid(loc_p1_grid);
  } else {
    draw_grid(loc_p2_grid);
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
    gridP2[ship[i][0]+11][ship[i][1]].hasShip = true;
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



function moveShip(grid, player, shpLng, c,p) {
  for (let i = 0; i < shpLng; i++) {
    grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
  } // clears old boat before drawing new boat
  for (let i = 0; i < shpLng; i++) {
    player.ships[a_s].loc[i][c]+=p;
    if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
      grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = [151,95,150];
    } else {
      grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = ["gray"];
    }

  } // draws new boat after clearing old boat
}



function fireAtCoords(grid_p1, grid_p2, p1, p2, y, x) {
  if (y <= 10) {return -1} // checking if the mouse was clicked on the targeting grid
  // console.log(grid_p1[y][x], y, x)
  // console.log(grid_p1[y][x])
  console.log("SHELL FIRED");
  grid_p1[y][x].beenHit = true;
  grid_p2[y-11][x].beenHit = true;
  p1.shots_fired++;
  // console.log(loc_p1_grid[y][x], y, x)
  grid_p1[y][x].resetColour();

  if (grid_p1[y][x].hasShip == true) {
    console.log("HIT");
    // grid_p1[y][x].colour = "red";
  } else {
    console.log("MISS");
    // grid_p1[y][x].colour = "white";
  }

  // wait for a few seconds before switching turn
  // setTimeout(changeTurn(), 5000); // doesn't want to work, not sure why and i'm pretty sure i'm using it correctly so i'm just not gonna use it
  changeTurn();

}

///////////////////////////////////////////   Event Functions   ///////////////////////////////////////////



function keyPressed() {
  // console.log(player_1.ships[a_s].length)
  let player;
  let grid;
  if (turn == 1) {
    player = player_1;
    grid = loc_p1_grid;
  } else if (turn == -1){
    player = player_2;
    grid = loc_p2_grid;
  }
  // console.log(player.ships[a_s].loc);
  // i'm very confident that this is actually very bad practice and probably brings a lot of issues with it
  // but i don't know how else to pass player_1 or player_2 to this function when it's their turn and this seems to work entirely because JS copies by reference instead of value
  // i genuinely never thought my life would actually be easier because of something i despise so much

  if (placeShips) {
    let shpLng = player.ships[a_s].loc.length;

    if (keyCode ===  98 || keyCode === 83 || keyCode === 40) {
      // console.log("DOWN")
      if ((tgt_r == 1 && tgt_y+shpLng<10) || (tgt_r != 1 && tgt_y<9)) {
        tgt_y++
        moveShip(grid, player, shpLng, 0, 1);
      } else {return -1}

      // grid[tgt_y][tgt_x].colour = [151,95,150]
      // grid[tgt_y-1][tgt_x].colour = grid[tgt_y-1][tgt_x].trueColour
    } // up     // W, NUMPAD_8
    if (keyCode === 100 || keyCode === 65 || keyCode === 37) {
      // console.log("LEFT")
      if ((tgt_x>0)) {
        tgt_x--
        moveShip(grid, player, shpLng, 1, -1);
      } else {return -1}

      // grid[tgt_y][tgt_x].colour = [151,95,150]
      // grid[tgt_y][tgt_x+1].colour = grid[tgt_y][tgt_x+1].trueColour

    } // left   // A, NUMPAD_4
    if (keyCode === 102 || keyCode === 68 || keyCode === 39) {
      // console.log("RIGHT")
      if ((tgt_r == -1 && tgt_x+shpLng<10) || (tgt_r != -1 && tgt_x<9)) {
        tgt_x++
        moveShip(grid, player, shpLng, 1, 1);
      } else {return -1}

      // grid[tgt_y][tgt_x].colour = [151,95,150]
      // grid[tgt_y][tgt_x-1].colour = grid[tgt_y][tgt_x-1].trueColour

    } // right  // D, NUMPAD_6
    if (keyCode === 104 || keyCode === 87 || keyCode === 38) {
      // console.log("UP")
      if ((tgt_y>0)) {
        tgt_y-- // not sure i actually need this but i kinda like it so i'm keeping it
        moveShip(grid, player, shpLng, 0, -1);
      } else {return -1}

      // grid[tgt_y][tgt_x].colour = [151,95,150]
      // grid[tgt_y+1][tgt_x].colour = grid[tgt_y+1][tgt_x].trueColour

    } // down   // S, NUMPAD_2


    if (keyCode === 82  || keyCode === 107) {
      console.log("ROTATE_SHIP");
      console.log(tgt_r);
      // let saveCoords = structuredClone(player.ships[a_s].loc);

      tgt_r *= -1;

      // rotating the ship's coordinates

      if (tgt_r == 1) {
        for (let i = 0; i < shpLng; i++) {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
          player.ships[a_s].loc[i][0] = player.ships[a_s].loc[i][0]+i
          player.ships[a_s].loc[i][1] = player.ships[a_s].loc[i][1]-i
          // console.log(player.ships[a_s].loc[i][0], player.ships[a_s].loc[i][1])

        }

        if (canRotate(player.ships[a_s].loc) == false) {
          tgt_r *= -1;
          for (let k = 0; k < shpLng; k++) {
            player.ships[a_s].loc[k][0] = player.ships[a_s].loc[k][0]-k
            player.ships[a_s].loc[k][1] = player.ships[a_s].loc[k][1]+k
            grid[player.ships[a_s].loc[k][0]][player.ships[a_s].loc[k][1]].colour = "gray";
          }
        }
      } else if (tgt_r == -1) {
        for (let i = 0; i < shpLng; i++) {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
          player.ships[a_s].loc[i][0] = player.ships[a_s].loc[i][0]-i
          player.ships[a_s].loc[i][1] = player.ships[a_s].loc[i][1]+i
          // console.log(player.ships[a_s].loc[i][0], player.ships[a_s].loc[i][1])

        }

        if (canRotate(player.ships[a_s].loc) == false) {
          tgt_r *= -1;
          for (let k = 0; k < shpLng; k++) {
            player.ships[a_s].loc[k][0] = player.ships[a_s].loc[k][0]+k
            player.ships[a_s].loc[k][1] = player.ships[a_s].loc[k][1]-k
            grid[player.ships[a_s].loc[k][0]][player.ships[a_s].loc[k][1]].colour = "gray";
          }
        }
      }

      for (let i = 0; i < shpLng; i++) {
        if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = [151,95,150];
        } else {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = ["gray"];
        }
      }

    } // rotate  // R, NUMPAD_PLUS
    // i can definitely condense this into one function for each rotation but i want to make the rest of the game work first, i might never get around to condensing this
    if (keyCode === 32 || keyCode === 13) {
      console.log("CONFIRM")

      for (let i = 0; i < shpLng; i++) {
        if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
          console.log("COLLISION DETECTED");
          return -1;
        } // error checking, prevents two ships from occupying the same coordinate
      }

      console.log("SHIP PLACED")
      // console.log(loc_p1_grid);
      // console.log(loc_p2_grid);


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

  /*
  if (keyCode === 16 || keyCode === 18) {
    // if (tempTurn == 1) {
    //   draw_grid(loc_p2_grid);
    //   tempTurn *= -1;
    // } else if (tempTurn == -1) {
    //   draw_grid(loc_p1_grid);
    //   tempTurn *= -1;
    // }
    changeTurn();


  }
  */
}


function mousePressed(event) {
  // if (placeShips == true) {return -1} // returns if ships are being placed, prevents shooting while moving into position

  let tileX = CVS_WIDTH / COLS;
  let tileY = CVS_HEIGHT / ROWS;
  let activeX = (mouseX - (mouseX % tileX)) / tileX;
  let activeY = (mouseY - (mouseY % tileY)) / tileY;
  // i have this code up in draw_grid so i could probably just make a helper function so i dont need the code twice but whatever lol

  if (turn == 1) {
    if (event.button === 2 && activeY > 10) {
      loc_p1_grid[prevActive[0]][prevActive[1]].resetColour(); // lets the player mark coordinates without firing on them if they want to think for a moment
      loc_p1_grid[activeY][activeX].colour = [128,80,190]
      prevActive = [activeY, activeX];
    } else if (event.button === 0) {
      fireAtCoords(loc_p1_grid, loc_p2_grid, player_1, player_2, activeY, activeX);
    // console.log("shoot:", activeY, activeX);
    }

  } else if (turn == -1) {
    if (event.button === 2 && activeY > 10) {
      loc_p2_grid[prevActive[0]][prevActive[1]].resetColour();
      loc_p2_grid[activeY][activeX].colour = [128,80,190]
      prevActive = [activeY, activeX];
    } else if (event.button === 0) {
      fireAtCoords(loc_p2_grid, loc_p1_grid, player_2, player_1, activeY, activeX);
    // console.log("shoot:", activeY, activeX);
    }

  }

}





// function log(str) {
//   document.getElementById("debug").innerHTML += "<br>" + str.toString();
// } // not working, don't know why, not gonna fix
