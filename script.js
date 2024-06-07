/**
 * ICS4U - Final Project
 *
 * Description:
 *
 * Author: Addie de Boer
 */

'use strict';


const CVS_WIDTH = 300;
const CVS_HEIGHT = 300;
const ROWS = 10;
const COLS = 10;

const X = CVS_WIDTH / COLS;
const Y = CVS_HEIGHT / ROWS;

// values for targeting / placing ships on coordinates
let tgt_x = 0;
let tgt_y = 0;
let tgt_r = 0;

let loc_cvs;
let tgt_cvs;
// let tgt_p1_cvs;
// let tgt_p2_cvs;


let tempShip = [[0,0],[0,1],[0,2]];

let loc_p1_grid = [];
let loc_p2_grid = [];

let player_1;
let player_2;


// booleans


let turn = 1; // between 1 and -1
let placeShips = true;
let a_s = 0; // short for activeShip, changed to a_s because activeShip was a bunch of characters and made the code minimally harder for me to read




// classes


class Tile {
  colour = [0, 0, 0];
  #trueColour;
  #hasShip = false;
  #beenHit = false;

  constructor(colour, value) {
    this.colour = colour;
    this.#trueColour = colour
    this.value = value;
  }

  get trueColour() {return this.#trueColour}
  get hasShip() {return this.#hasShip};
  get beenHit() {return this.#beenHit};

  set hasShip(item) {this.#hasShip = item; this.#trueColour = "gray"};
  set beenHit(item) {this.#beenHit = item};

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
  #type = ""
  #seaworthy = true; // if ship is still alive
  #length = [];
  #name;
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
  #coords;
  bingus;

  constructor(coords) {
    this.#coords = coords
    this.bingus = "bingus"; // bingus
  }
}






// functions





function setup() {
  loc_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  // tgt_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);

  // loc_cvs.parent("loc_cvs_div");
  // tgt_cvs.parent("tgt_cvs_div");
  loc_cvs.position(10,10, "fixed");

  // tgt_p1_grid.position(400,400);
  // Initialize the grid to all white squares
  grid_gen(loc_p1_grid);
  grid_gen(loc_p2_grid);
  // grid_gen(tgt_p1_grid)


  initGame();
}


function grid_gen(grid) {
  for (let y = 0; y < ROWS; y++) {
    grid[y] = [];
    for (let x = 0; x < COLS; x++) {
      if ((x+y) % 2 == 0) {
        grid[y].push(new Tile([0, 120, 230], 0));
      } else {
        grid[y].push(new Tile([0,130,230], 0));
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
}







// Draw a new frame of the scene
function draw() {
  // Clear the screen with a grey rectangle
  background(220);

  // Draw the grid
  if (turn == 1) {
    draw_grid(loc_p1_grid, COLS, ROWS);
  } else if (turn == -1) {
    draw_grid(loc_p2_grid, COLS, ROWS);

  }
}

function draw_grid(grid, x, y) {
  // Get the size of each square
  let width = Math.floor(CVS_WIDTH/x);
  let height = Math.floor(CVS_HEIGHT/y);

  // Center the grid on the canvas if there's a rounding error
  let x_buffer = (CVS_WIDTH - width*x)/2
  let y_buffer = (CVS_HEIGHT - height*y)/2


  for (let row = 0; row < y; row++) {
    for (let col = 0; col < x; col++) {
      if (grid[row][col].colour == "gray") {
        noStroke();
      } else {stroke([5,51,128])}
      // Fill the square with the r,g,b values from the model
      fill(grid[row][col].colour);
      rect(col*width + x_buffer, row*height + y_buffer, width, height);
    }
  }
}



function initGame() {
  player_1 = new Player(1);
  player_2 = new Player(-1);

  player_1.username = "USN";
  player_2.username = "IJN";


  drawShip(player_1.ships[a_s].loc);

  // shipPlacement(player_1);w
  // shipPlacement(player_2);
}


function drawShip(ship) {
  // console.log(ship);
  for (let i = 0; i < ship.length; i++) {
    loc_p1_grid[ship[i][0]][ship[i][1]].colour = "gray";
  }
}

function placeShip(grid, ship) {
  // a_s defining which ship is being placed currently
  a_s++;
  for (let i = 0; i < ship.length; i++) {
    grid[ship[i][0]][ship[i][1]].hasShip = true;
  }

  if (a_s > 4) {
    a_s = 0;
    if (turn == -1) {placeShips = false}
    changeTurn();
  }
}


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
  // but i don't know how else to pass player_1 or player_2 to this function when it's their turn and this seems to work
  // so i'll stick with it and i'll fight you over it

  if (placeShips) {
    let shpLng = player.ships[a_s].loc.length;

    if (keyCode === 98 || keyCode === 83) {
      // console.log("DOWN")
      if ((tgt_r == 1 && tgt_y+shpLng<10) || (tgt_r != 1 && tgt_y<9)) {
        tgt_y++

        for (let i = 0; i < shpLng; i++) {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
        } // clears old boat before drawing new boat
        for (let i = 0; i < shpLng; i++) {
          player.ships[a_s].loc[i][0]++;
          if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
            grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = [151,95,150];
          } else {
            grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = ["gray"];
          }

        } // draws new boat after clearing old boat
      } else {return -1}

      // grid[tgt_y][tgt_x].colour = [151,95,150]
      // grid[tgt_y-1][tgt_x].colour = grid[tgt_y-1][tgt_x].trueColour
    } // up     // W, NUMPAD_8
    if (keyCode === 100 || keyCode === 65) {
      // console.log("LEFT")
      if ((tgt_r == 2 && tgt_x-shpLng>0) ||(tgt_r != 2 && tgt_x>0)) {
        tgt_x--

        for (let i = 0; i < shpLng; i++) {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
        } // clears old boat before drawing new boat
        for (let i = 0; i < shpLng; i++) {
          player.ships[a_s].loc[i][1]--;
          if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
            grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = [151,95,150];
          } else {
            grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = ["gray"];
          }
        } // draws new boat after clearing old boat
      } else {return -1}

      // grid[tgt_y][tgt_x].colour = [151,95,150]
      // grid[tgt_y][tgt_x+1].colour = grid[tgt_y][tgt_x+1].trueColour

    } // left   // A, NUMPAD_4
    if (keyCode === 102 || keyCode === 68) {
      // console.log("RIGHT")
      if ((tgt_r == 0 && tgt_x+shpLng<10) || (tgt_r != 0 && tgt_x<9)) {
        tgt_x++

        for (let i = 0; i < shpLng; i++) {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
        } // clears old boat before drawing new boat
        for (let i = 0; i < shpLng; i++) {
          player.ships[a_s].loc[i][1]++;
          if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
            grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = [151,95,150];
          } else {
            grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = ["gray"];
          }        } // draws new boat after clearing old boat

      } else {return -1}

      // grid[tgt_y][tgt_x].colour = [151,95,150]
      // grid[tgt_y][tgt_x-1].colour = grid[tgt_y][tgt_x-1].trueColour

    } // right  // D, NUMPAD_6
    if (keyCode === 104 || keyCode === 87) {
      // console.log("UP")
      if ((tgt_r == 3 && tgt_y-shpLng>0) ||(tgt_r != 3 && tgt_y>0)) {
        tgt_y-- // not sure i actually need this but i kinda like it so i'm keeping it

        for (let i = 0; i < shpLng; i++) {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
        } // clears old boat before drawing new boat
        for (let i = 0; i < shpLng; i++) {
          player.ships[a_s].loc[i][0]--;
          if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
            grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = [151,95,150];
          } else {
            grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].colour = ["gray"];
          }
        } // draws new boat after clearing old boat
      } else {return -1}

      // grid[tgt_y][tgt_x].colour = [151,95,150]
      // grid[tgt_y+1][tgt_x].colour = grid[tgt_y+1][tgt_x].trueColour

    } // down   // S, NUMPAD_2


    if (keyCode === 82  || keyCode === 107) {
      console.log("ROTATE_SHIP");
      console.log(tgt_r);
      // let saveCoords = structuredClone(player.ships[a_s].loc);

      if (tgt_r == 3) {tgt_r = 0} else {tgt_r++}

      // rotating the ship's coordinates
      // there's probably a way i can do this in like four lines but i'm running short on time so i gotta zoom
      if (tgt_r == 1) {
        for (let i = 0; i < shpLng; i++) {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
          player.ships[a_s].loc[i][0] = player.ships[a_s].loc[i][0]+i
          player.ships[a_s].loc[i][1] = player.ships[a_s].loc[i][1]-i
          // console.log(player.ships[a_s].loc[i][0], player.ships[a_s].loc[i][1])

        }

        if (canRotate(player.ships[a_s].loc) == false) {
          tgt_r--;
          for (let k = 0; k < shpLng; k++) {
            player.ships[a_s].loc[k][0] = player.ships[a_s].loc[k][0]-k
            player.ships[a_s].loc[k][1] = player.ships[a_s].loc[k][1]+k
            grid[player.ships[a_s].loc[k][0]][player.ships[a_s].loc[k][1]].colour = "gray";
          }
        }


      } else if (tgt_r == 2) {
        for (let i = 0; i < shpLng; i++) {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
          player.ships[a_s].loc[i][0] = player.ships[a_s].loc[i][0]-i
          player.ships[a_s].loc[i][1] = player.ships[a_s].loc[i][1]-i
          // console.log(player.ships[a_s].loc[i][0], player.ships[a_s].loc[i][1])

        }

        if (canRotate(player.ships[a_s].loc) == false) {
          tgt_r--;
          for (let k = 0; k < shpLng; k++) {
            player.ships[a_s].loc[k][0] = player.ships[a_s].loc[k][0]+k
            player.ships[a_s].loc[k][1] = player.ships[a_s].loc[k][1]+k
            grid[player.ships[a_s].loc[k][0]][player.ships[a_s].loc[k][1]].colour = "gray";
          }
        }


      } else if (tgt_r == 3) {
        for (let i = 0; i < shpLng; i++) {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
          player.ships[a_s].loc[i][0] = player.ships[a_s].loc[i][0]-i
          player.ships[a_s].loc[i][1] = player.ships[a_s].loc[i][1]+i
          // console.log(player.ships[a_s].loc[i][0], player.ships[a_s].loc[i][1])

        }

        if (canRotate(player.ships[a_s].loc) == false) {
          tgt_r--;
          for (let k = 0; k < shpLng; k++) {
            player.ships[a_s].loc[k][0] = player.ships[a_s].loc[k][0]+k
            player.ships[a_s].loc[k][1] = player.ships[a_s].loc[k][1]-k
            grid[player.ships[a_s].loc[k][0]][player.ships[a_s].loc[k][1]].colour = "gray";
          }
        }


      } else if (tgt_r == 0){
        for (let i = 0; i < shpLng; i++) {
          grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].resetColour()
          player.ships[a_s].loc[i][0] = player.ships[a_s].loc[i][0]+i
          player.ships[a_s].loc[i][1] = player.ships[a_s].loc[i][1]+i
          // console.log(player.ships[a_s].loc[i][0], player.ships[a_s].loc[i][1])

        }

        if (canRotate(player.ships[a_s].loc) == false) {
          tgt_r--;
          for (let k = 0; k < shpLng; k++) {
            player.ships[a_s].loc[k][0] = player.ships[a_s].loc[k][0]-k
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

    if (keyCode === 32 || keyCode === 13) {
      console.log("CONFIRM")

      for (let i = 0; i < shpLng; i++) {
        if (grid[player.ships[a_s].loc[i][0]][player.ships[a_s].loc[i][1]].hasShip == true) {
          console.log("COLLISION DETECTED");
          return -1;
        } // error checking, prevents two ships from occupying the same coordinate
      }

      console.log("SHIP PLACED")

      tgt_r = 0;
      tgt_x = 0;
      tgt_y = 0;

      if (turn == 1) {
        placeShip(loc_p1_grid, player.ships[a_s].loc);
        drawShip(player_1.ships[a_s+1].loc)
      }
      else {
        placeShip(loc_p2_grid, player.ships[a_s].loc)
        drawShip(player_2.ships[a_s+1].loc)
      }
    } // confirm // SPACE, ENTER, NUMPAD_ENTER
  }


}


function canRotate(coords) {
  for (let j = 0; j < coords.length; j++) {
    // console.log(coords[j])
    if (coords[j][0] < 0 || coords[j][1] < 0 || coords[j][0] > 9 || coords[j][1] > 9) {
      return false;
    }
  }
} // checks if the coordinates the ship is being rotated to are within the battlefield's borders



function flashy(coords, grid) {
  for (let f = 0; f < coords.length; f++) {
    grid[coords[f][0]][coords[f][1]].colour = "red";
    // something to make it wait
    grid[coords[f][0]][coords[f][1]].colour = grid[coords[f][0]][coords[f][1]].trueColour;

  }
} // meant to be used to flash location when the ship can't go there, but i'm not gonna code that rn


// function log(str) {
//   document.getElementById("debug").innerHTML += "<br>" + str.toString();
// } // not working, don't know why, not gonna fix
