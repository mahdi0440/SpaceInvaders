let gameWindow;             // main game window
let gameMenu;               // main game menu
let gameOverScreen;         // main game game over screen
let enemyCont;              // enemy container
let enemyPosY = 12;         // enemies position y
let enemyPosX = 50          // enemies position X
let moving = false;         // check if enemies are moving
let moveVal;                // enemy movement interval
let enemies = 0;            // enemies current level
let enemiesKilled;          // enemies killed current level
let totalEnemiesKilled = 0; // total enemies killed
let player;                 // player sprite
let score = 0;              // total accumulated score
let bgPosY = 0;             // background Y position
let posX = 42;              // player x position
let level = 0               // current game level
let dead = false;           // player lost round
let lifes = 3;              // users total lifes
let loop;                   // game loop

// initialize game
window.onload = initMenu;

// initiate game menu, prepearing game
function initMenu() {
    document.querySelector('#back-to-menu').addEventListener('click', backToMenu);
    document.querySelector('#start-game').addEventListener('click', startGame);
    document.querySelector('input').addEventListener('keyup', (e) => validateName(e));
    gameWindow = document.querySelector('#game-window');
    gameMenu = document.querySelector('#menu');
    gameOverScreen = document.querySelector('#game-over');
}

// spawn lifes on game start
function spawnLife() {
    for (let i = 0; i < 3; i++) {
        const life = document.createElement('img');
        life.className = 'life';
        life.src = 'assets/ui/life.png';
        life.alt = 'life';
        document.querySelector('#life').appendChild(life);
    }
}

// display game over menu
function gameOverMenu() {
    document.title = 'Game over!';
    $('body').unbind('keypress');
    gameMenu.style.display = 'none';
    gameWindow.style.display = 'none';
    gameOverScreen.style.display = 'block';
}

// navigate back to menu 
function backToMenu() {
    document.title = 'Space Invaders';
    gameOverScreen.style.display = 'none';
    gameMenu.style.display = 'block';
}

// start main game
function startGame() {
    gameMenu.style.display = 'none';
    gameWindow.style.display = 'block';
    spawnLife();
    initPlayer();
    showLevelAnnouncement();
    startLevel();
    gameLoop();
}

// initalize game loop
function gameLoop() {
    loop = setInterval(() => {
        updateScore();
        moveBg();
    }, 100);
}

// update score
function updateScore() {
    score += 5;
    document.querySelector('#score').innerHTML = `Score: ${score}`;
}

// animate game background
function moveBg() {
    gameWindow.style.backgroundPosition = `100% ${bgPosY}%`;
    if (bgPosY >= 100) {
        bgPosY = 0;
    }
    bgPosY += 10;
}

// initialize player and movements
function initPlayer() {
    player = document.querySelector('#player-cont');
    player.style.left = `${posX}%`;
    $('body').bind('keypress', (e) => {
        if (e.keyCode === 13 || e.keyCode === 32) {
            shoot();
        }

        else if (e.key === 'a' || e.key === 'A') {
            if (posX >= 2) {
                moveLeft();
            }
        }

        else if (e.key === 'd' || e.key === 'D') {
            if (posX <= 86) {
                moveRight();
            }
        }
    
    });
    document.body.addEventListener('keyup', () => {
        player.style.transform = 'rotate(0deg)';
    });
}

// shoot bullet from players position
function shoot() {
    let bulletPosY = 5;
    const bullet = document.createElement('div');
    bullet.className = `bullet animated pulse bullet${Math.floor(Math.random() * 5) + 1}`;
    bullet.style.left = `${(posX + 5)}%`;
    
    playSound('shoot');
    gameWindow.appendChild(bullet);

    const moveBullet = setInterval(() => {
        if (bulletPosY <= 94) {
            bulletPosY += 5;
            bullet.style.bottom = `${bulletPosY}%`;
            hitEnemy(bullet);
        }

        else {
            gameWindow.removeChild(bullet);
            clearInterval(moveBullet);
        }
    }, 75);
}

// move player to the left
function moveLeft() {
    posX -= 4;
    
    if (posX <= 0) {
        posX = 86;
    }
    player.style.transform = 'rotate(-10deg)';
    player.style.left = `${posX}%`;
}

// move player to the right
function moveRight() {
    posX += 4;
    
    if (posX >= 90) {
        posX = 2;
    }
    
    player.style.transform = 'rotate(10deg)';
    player.style.left = `${posX}%`;
}

// start new level 
function startLevel() {
    enemiesKilled = 0;
    if (enemies < 18) {
        enemies++;
    }
    level++;
    updateStats();
    document.querySelector('#level').innerHTML = `Level: ${level}`;
    enemyCont = document.querySelector('#enemy-cont');
    
    // render enemies
    enemies = enemies > 18 ? 18 : enemies;
    for (let i = 0; i < enemies; i++) {
        setTimeout(() => {
            createEnemy(i);
        }, i * 100);
    } 
    moveEnemies();
}

// move enemies in pattern depending on level
function moveEnemies() {
    moveVal = setInterval(() => {
        enemyPosY += getMovement();
        if (moving) {
            enemyPosX += getMovement();
            moving = false;
        }
        else {
            enemyPosX -= getMovement();
            moving = true;
        }
        enemyCont.style.top = `${enemyPosY}%`;
        enemyCont.style.left = `${enemyPosX}%`;
        hitPlayer();
    }, levelSpeed());
}

// set enemy movement speed depening on current level
function levelSpeed() {
    const value = (2000 - (level * 35));
    if (value <= 500) {
        return 500 - (level * 2);
    }
    return value;
}

// return a movement strength of 1 - 4
function getMovement() {
    return Math.floor(Math.random() * 4) + 1;
}

// create a new enemy and position on screen
function createEnemy(enemyIndex) {
    const enemy = document.createElement('img');
    enemy.src = 'assets/sprites/invader.png';    
    enemy.className = 'enemy animated zoomInUp';
    setTimeout(() => {
        enemy.className = 'enemy spawned-enemy';
    }, 1000);
    setTimeout(() => {
    }, 500);
    enemyCont.appendChild(enemy);
}

// attempt to detect if enemy is hit by bullet
function hitEnemy(bullet) {
    const bulletPos = bullet.getBoundingClientRect()
    Array.from(document.querySelectorAll('.enemy')).forEach((enemy) => {
        const enemyPos = enemy.getBoundingClientRect();
        if (bulletPos.x >= enemyPos.left &&
        bulletPos.x <= enemyPos.right &&
        bulletPos.y >= enemyPos.top &&
        bulletPos.y <= enemyPos.bottom && bullet.style.opacity !== '0') {
            if (enemy.style.opacity !== '0') {
                bullet.style.opacity = '0';
                removeEnemy(enemy);
            }
        }
    });
}

// attempt to detect if player is hit by enemy
function hitPlayer() {
    const playerPos = player.getBoundingClientRect();
    Array.from(document.querySelectorAll('.enemy')).forEach((enemy) => {
        const enemyPos = enemy.getBoundingClientRect();
        if (playerPos.x >= enemyPos.left &&
        playerPos.x <= enemyPos.right &&
        playerPos.y >= enemyPos.top &&
        playerPos.y <= enemyPos.bottom || 
        enemyPos.bottom + 20 >= gameWindow.getBoundingClientRect().bottom) {
            if (enemy.style.opacity !== '0') {
                dead = true;
                removeLife();
            }
        }
    });
}

// remove a life from player
function removeLife() {
    lifes--;
    score -= 1000;
    playSound('explosion');

    Array.from(document.querySelectorAll('.life'))
    .reverse()[0].className = 'life animated bounceOut';
    setTimeout(() => {
        document.querySelector('#life')
        .removeChild(Array.from(document.querySelectorAll('.life'))
        .reverse()[0]);
    }, 1000);
    
    // if out of life, game is over
    if (lifes === 0) {
        gameOver();
        return;
    }
    
    // else we update stats and trigger next level
    updateStats();
}

// game over, clean up loops and enemies remaining on screen
function gameOver() {
    clearInterval(loop);
    clearEnemies();
    gameOverMenu();
}

// update game stats
function updateStats() {
    document.querySelector('#stats').innerHTML = `Enemies Killed: ${enemiesKilled}/${enemies}`;
    if (enemiesKilled === enemies || dead) {
        clearEnemies();
        dead = false;
        enemyPosY = 12;
        enemyPosX = 50;
        enemyCont.style.top = `${enemyPosY}%`;
        enemyCont.style.left = `${enemyPosX}%`;
        clearInterval(moveVal);
        showLevelAnnouncement();
        setTimeout(() => {
            startLevel();
        }, 1000);
    }
}

// clear all enemies from screen
function clearEnemies() {
    Array.from(document.querySelectorAll('.enemy')).forEach((enemy) => {
        enemyCont.removeChild(enemy);
    });
}

// display announcement of current level
function showLevelAnnouncement() {
    const announcement = document.querySelector('#announcement');
    announcement.innerHTML = `LEVEL ${level + 1}`;
    announcement.className = 'animated fadeInUp';
    announcement.style.display = 'block';
    setTimeout(() => {
        announcement.className = 'animated fadeOutUp';
        setTimeout(() => {
            announcement.style.display = 'none';
        }, 1000);
    }, 1000);
}

// remove enemy from game
function removeEnemy(enemy) {
    playSound('invaderkilled');
    enemy.style.opacity = '0';
    enemiesKilled++;
    totalEnemiesKilled++;
    score += 100;
    updateStats();
}

// play sound depending on parameter
function playSound(sound) {
    const audio = document.createElement('audio');
    audio.src = `assets/sounds/${sound}.wav`;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.volume = '0.2';
    audio.play();
    setTimeout(() => {
        document.body.removeChild(audio);
    }, 1000);
}

// reset game, clear and reset dependency variables
function reset() {
    score = 0;
    level = 0;
    dead = false;
    lifes = 3;
    enemyPosY = 12;
    enemyPosX = 50;
    moving = false;
    enemies = 0;
    enemiesKilled = 0;
    totalEnemiesKilled = 0;
    loop = null;
    enemyCont.style.top = '12%';
    clearInterval(moveVal);
    clearEnemies();
}