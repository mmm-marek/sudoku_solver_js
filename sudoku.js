// ----------CLIENT-SIDE SUDOKU SOLVER IN JAVASCRIPT----------


// -------------------FIND CORRECT NUMBER---------------------
function isCorrectInRow(sudoku, row, number) {
    for (let col = 0; col < 9; col++) {
        if (number === sudoku[row][col]) {
            return false;
        }
    }
    return true;
}


function isCorrectInCol(sudoku, col, number) {
    for (let row = 0; row < 9; row++) {
        if (number === sudoku[row][col]) {
            return false;
        }
    }
    return true;
}


function isCorrectInSquare(sudoku, orig_row, orig_col, number) {
    const row_square = (Math.floor(orig_row / 3) * 3);
    const col_square = (Math.floor(orig_col / 3) * 3);
    for (let row = row_square; row < row_square + 3; row++) {
        for (let col = col_square; col < col_square + 3; col++) {
            if (number === sudoku[row][col]) {
                return false;
            }
        }
    }
    return true;
}


function isCorrect(sudoku, row, col, number) {
    return isCorrectInRow(sudoku, row, number)
        && isCorrectInCol(sudoku, col, number)
        && isCorrectInSquare(sudoku, row, col, number);
}

// ------------------------STYLE CELL-------------------------

async function wait(ms) {
    await new Promise(r => setTimeout(r, ms));
}


function resetCell(sudoku, cells, row, col) {
    sudoku[row][col] = 0;
    cells[row * 9 + col].innerText = 0;
    cells[row * 9 + col].classList.remove("beingSolvedColor", "solved");
}


function setCell(sudoku, cells, row, col, number_to_be_inserted) {
    resetCell(sudoku, cells, row, col);
    sudoku[row][col] = number_to_be_inserted;
    cells[row * 9 + col].innerText = number_to_be_inserted;
}


function updateCell(sudoku, cells, row, col, number) {
    sudoku[row][col] = number;
    cells[row * 9 + col].innerText = number;
    cells[row * 9 + col].classList.add("beingSolvedColor");
}


async function solvedCell(cells, row, col) {
    await wait(1);
    cells[row * 9 + col].classList.add("solved");
    return true;
}

// ------------------------PARSE & VERIFY INPUT------------------------
function verifyInput(sudokuInput) {
    if (sudokuInput.length != 81) {
        return false;
    }
    for (let char of sudokuInput) {
        if (isNaN(char)) {
            return false;
        }
    }
    return true;
}


function parseInput(sudokuString, cells) {
    const sudoku = [[], [], [], [], [], [], [], [], []];

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let number_to_be_inserted = parseInt(sudokuString[(row * 9) + col]);
            setCell(sudoku, cells, row, col, number_to_be_inserted);
        }
    }

    return sudoku;
}

// ---------------------------SOLVE---------------------------

function noEmptyCells(row, col) {
    return row === null || col === null;
}


function findEmpty(sudoku) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (sudoku[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return [null, null];
}


async function tryEveryNumber(sudoku, cells, row, col) {
    for (let number = 1; number <= 9; number++) {
        if (!isCorrect(sudoku, row, col, number)) {
            continue;
        }

        updateCell(sudoku, cells, row, col, number);
        await wait(1);

        if (await backtrackSolution(sudoku, cells)) {
            return solvedCell(cells, row, col)
        }
        resetCell(sudoku, cells, row, col);
    }
    return false;
}


async function backtrackSolution(sudoku, cells) {
    const [row, col] = findEmpty(sudoku);
    if (noEmptyCells(row, col)) {
        return true;
    }

    const solved = await tryEveryNumber(sudoku, cells, row, col);
    return solved;
}


// ----------------------------MAIN---------------------------
function restoreInput(sudokuInput, button) {
    sudokuInput.value = "";
    button.disabled = false;
}


function querySelecting() {
    const sudokuInput = document.querySelector("#sudokuInput");
    const cells = document.querySelectorAll("td");
    const button = document.querySelector("#solve");
    button.disabled = true;
    return { sudokuInput, cells, button };
}

const sudokuForm = document.querySelector("#sudokuForm");
sudokuForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { sudokuInput, cells, button } = querySelecting();

    if (!verifyInput(sudokuInput.value)) {
        alert("Wrong format of input.");
        return restoreInput(sudokuInput, button);
    }
    const sudoku = parseInput(sudokuInput.value, cells);

    if (!await backtrackSolution(sudoku, cells)) {
        alert("This sudoku has no solution");
    }
    return restoreInput(sudokuInput, button);
})
