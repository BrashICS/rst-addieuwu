/**
 * ICS4U - Final Project
 *
 * Description:
 *
 * Author: Addie de Boer
 */

'use strict';


const CVS_WIDTH = 600;
const CVS_HEIGHT = 600;
const ROWS = 10;
const COLS = 10;

const X = CVS_WIDTH / COLS;
const Y = CVS_HEIGHT / ROWS;

// values for targeting / placing ships on coordinates
let tgt_x = 0;
let tgt_y = 0;
let tgt_r = 0;

let loc_p1_cvs;
let loc_p2_cvs;
// let tgt_p1_cvs;
// let tgt_p2_cvs;


let tempShip = [[0,0],[0,1],[0,2],[0,3],[0,4]];

let loc_p1_grid = [];
let loc_p2_grid = [];

let player_1;
let player_2;


// booleans


let turn = 1; // between 1 and -1
let placeShips = true;
let activeShip = 0;




// classes


class Tile {
  colour = [0, 0, 0];
  #trueColour;
  value = 0;

  constructor(colour, value) {
    this.colour = colour;
    this.#trueColour = colour
    this.value = value;
  }

  get trueColour() {return this.#trueColour}
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
  #length;
  #name;
  // #coordinates;
  #rotation;

  constructor(length, type, name, rotation) {
    this.#type = type;
    this.#length = new Array(length).fill(Compartment);
    this.#name = name;
    // this.#coordinates = coordinates;
    this.#rotation = rotation;
  }


  get name() {return this.#name}
  get length() {return this.#length}
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
  loc_p1_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  // loc_p2_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  // tgt_p1_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  // // tgt_p2_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  loc_p1_cvs.parent(loc_cvs_div); // i think this makes sense, i tried putting the canvas in a div so i can reposition it later

  // tgt_p1_grid.position(400,400);
  // Initialize the grid to all white squares
  grid_gen(loc_p1_grid)
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
}



function shipPlacement(player) {

  // place ships in descending length
  // ac, bt, ds, sb, pt

  drawShip(player.ships[1])

}



// Draw a new frame of the scene
function draw() {
  // Clear the screen with a grey rectangle
  background(220);

  // Draw the grid
  draw_grid(COLS, ROWS);
}

function draw_grid(x, y) {
  // Get the size of each square
  let width = Math.floor(CVS_WIDTH/x);
  let height = Math.floor(CVS_HEIGHT/y);

  // Center the grid on the canvas if there's a rounding error
  let x_buffer = (CVS_WIDTH - width*x)/2
  let y_buffer = (CVS_HEIGHT - height*y)/2


  for (let row = 0; row < y; row++) {
    for (let col = 0; col < x; col++) {
      if (loc_p1_grid[row][col].colour == "gray") {
        noStroke();
      } else {stroke([5,51,128])}
      // Fill the square with the r,g,b values from the model
      fill(loc_p1_grid[row][col].colour);
      rect(col*width + x_buffer, row*height + y_buffer, width, height);
    }
  }
}



function initGame() {
  player_1 = new Player(1);
  player_2 = new Player(-1);

  player_1.username = "USN";
  player_2.username = "IJN";


  drawShip(tempShip);

  // shipPlacement(player_1);
  // shipPlacement(player_2);
}


function drawShip(ship) {
  // console.log(ship);
  for (let i = 0; i < ship.length; i++) {
    loc_p1_grid[ship[i][0]][ship[i][1]].colour = "gray";
  }
}

function placeShip(player) {
  // activeShip defining which ship is being placed currently
  activeShip++;

  if (activeShip > 4) {
    activeShip = 0;
    if (turn == -1) {placeShips = false} else {changeTurn()}
  }
}


function keyPressed() {
  // let shpLng = player_1.ships[activeShip].length.length;
  let shpLng = tempShip.length;

  // console.log(player_1.ships[activeShip].length)
  if (placeShips) {
    if (keyCode === 98 || keyCode === 83) {
      // console.log("DOWN")
      if ((tgt_r == 1 && tgt_y+shpLng<10) || (tgt_r != 1 && tgt_y<9)) {
        tgt_y++

        for (let i = 0; i < shpLng; i++) {
          loc_p1_grid[tempShip[i][0]][tempShip[i][1]].colour = loc_p1_grid[tempShip[i][0]][tempShip[i][1]].trueColour;
        } // clears old boat before drawing new boat
        for (let i = 0; i < shpLng; i++) {
          tempShip[i][0]++;
          loc_p1_grid[tempShip[i][0]][tempShip[i][1]].colour = ["gray"];
        } // draws new boat after clearing old boat
      } else {return -1}

      // loc_p1_grid[tgt_y][tgt_x].colour = [151,95,150]
      // loc_p1_grid[tgt_y-1][tgt_x].colour = loc_p1_grid[tgt_y-1][tgt_x].trueColour
    }
    if (keyCode === 100 || keyCode === 65) {
      // console.log("LEFT")
      if ((tgt_r == 2 && tgt_x-shpLng>0) ||(tgt_r != 2 && tgt_x>0)) {
        tgt_x--

        for (let i = 0; i < shpLng; i++) {
          loc_p1_grid[tempShip[i][0]][tempShip[i][1]].colour = loc_p1_grid[tempShip[i][0]][tempShip[i][1]].trueColour;
        } // clears old boat before drawing new boat
        for (let i = 0; i < shpLng; i++) {
          tempShip[i][1]--;
          loc_p1_grid[tempShip[i][0]][tempShip[i][1]].colour = ["gray"];
        } // draws new boat after clearing old boat
      } else {return -1}

      // loc_p1_grid[tgt_y][tgt_x].colour = [151,95,150]
      // loc_p1_grid[tgt_y][tgt_x+1].colour = loc_p1_grid[tgt_y][tgt_x+1].trueColour

    }
    if (keyCode === 102 || keyCode === 68) {
      // console.log("RIGHT")
      if ((tgt_r == 0 && tgt_x+shpLng<10) || (tgt_r != 0 && tgt_x<9)) {
        tgt_x++

        for (let i = 0; i < shpLng; i++) {
          loc_p1_grid[tempShip[i][0]][tempShip[i][1]].colour = loc_p1_grid[tempShip[i][0]][tempShip[i][1]].trueColour;
        } // clears old boat before drawing new boat
        for (let i = 0; i < shpLng; i++) {
          tempShip[i][1]++;
          loc_p1_grid[tempShip[i][0]][tempShip[i][1]].colour = ["gray"];
        } // draws new boat after clearing old boat

      } else {return -1}

      // loc_p1_grid[tgt_y][tgt_x].colour = [151,95,150]
      // loc_p1_grid[tgt_y][tgt_x-1].colour = loc_p1_grid[tgt_y][tgt_x-1].trueColour

    }
    if (keyCode === 104 || keyCode === 87) {
      // console.log("UP")
      if ((tgt_r == 3 && tgt_y-shpLng>0) ||(tgt_r != 3 && tgt_y>0)) {
        tgt_y-- // not sure i actually need this but i kinda like it so i'm keeping it

        for (let i = 0; i < shpLng; i++) {
          loc_p1_grid[tempShip[i][0]][tempShip[i][1]].colour = loc_p1_grid[tempShip[i][0]][tempShip[i][1]].trueColour;
        } // clears old boat before drawing new boat
        for (let i = 0; i < shpLng; i++) {
          tempShip[i][0]--;
          loc_p1_grid[tempShip[i][0]][tempShip[i][1]].colour = ["gray"];
        } // draws new boat after clearing old boat
      } else {return -1}

      // loc_p1_grid[tgt_y][tgt_x].colour = [151,95,150]
      // loc_p1_grid[tgt_y+1][tgt_x].colour = loc_p1_grid[tgt_y+1][tgt_x].trueColour

    }


    if (keyCode === 82  || keyCode === 107) {
      console.log("ROTATE_SHIP")
      if (tgt_r == 3) {tgt_r = 0} else {tgt_r++}
      console.log(tgt_r)

    }

    if (keyCode === 32 || keyCode === 13) {
      console.log("CONFIRM")
      if (turn == 1) {placeShip(player_1)}
      else {placeShip(player_2)}
    }
  }

  console.log(tgt_x + shpLng, tgt_r)

}





function log(str) {
  document.getElementById("debug").innerHTML += "<br>" + str.toString();
} // not working, don't know why, not gonna fix
