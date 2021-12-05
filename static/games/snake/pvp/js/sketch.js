const scoreCounter = document.querySelector(".score-counter"); //TODO: Color scheme??
const messageBox = document.querySelector(".message-box");

const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");

let config = null;
let textures = null;

const socket = io(window.location.host, {
    path: "/snake/pvp/socket/"
});
console.log(window.location);

function gameOver() {
    setMessageBoxContents("#game-over-template");
    //document.querySelector("#game-over-text").textContent = game.gameEndText;
    showMessageBox();
}

function hideMessageBox() {
    messageBox.style.display = "none";
}

function showMessageBox() {
    messageBox.style.display = "block";
}

function setMessageBoxContents(templateID) {
    let templateContents = document.querySelector(templateID);
    messageBox.innerHTML = "";
    messageBox.appendChild(templateContents.content.cloneNode(true));
}

socket.on("game_config", message => {
    config = JSON.parse(message);
    console.log(config)
    canvas.width = config.tileCount * config.tileSize;
    canvas.height = config.tileCount * config.tileSize;

    textures = createTextures(config);
    textures.setContext(context);
    socket.emit("get_game_state");
});

socket.on("game_state", gameStateRaw => {
    const gameState = JSON.parse(gameStateRaw);
    textures.drawArena();
    textures.drawApple(gameState.apple);
    textures.drawSnake1(gameState.snake1);
    textures.drawSnake2(gameState.snake2);
});

socket.on("display_message", message => {
    if (message) {
        showMessageBox();
        if (message === "instructionsP1") {
            setMessageBoxContents("#instructions-template");
            document.querySelector("#instructions-sideteller").textContent = "You are purple";
            return;
        } else if (message === "instructionsP2") {
            setMessageBoxContents("#instructions-template");
            document.querySelector("#instructions-sideteller").textContent = "You are yellow";
            return;
        }
        setMessageBoxContents("#message-display-template");
        document.querySelector("#message-display").innerHTML = message;
    } else {
        hideMessageBox();
    }
});

socket.on("game_over", message => {
    setMessageBoxContents("#game-over-template");
    document.querySelector("#game-over-text").textContent = message;
    showMessageBox();
});

socket.on("update_length", length => {
    scoreCounter.textContent = length;
});

socket.on("redirect", () => {
    window.location = "/";
});

socket.on("debug", (message) => {
    console.log(message);
});

function start() {
    const code = document.cookie.split("=")[1];
    if (!code) {
        window.location = "/";
    }
    socket.emit("join_game", code);
    scoreCounter.textContent = `Code: ${code}`;
    window.addEventListener("keydown", (e) => {
        socket.emit("game_input", e.code);
    });
    socket.emit("get_game_config");
}

window.onload = start;