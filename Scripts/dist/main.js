require('config');
const Queen = require('class.queen');

const queen = new Queen(_PlayerName_, _HomeShard_, _HomeRoom_);

(function(){
    // 初始化整个系统
    // 为避免污染变量环境，包裹整个函数体
    queen.junction();
}());


module.exports.loop = function () {


    timeSchedule();

    queen.doCommand();
};


function timeSchedule() {
    if(Game.time % 10 === 0){
        console.log(`${Game.time}|log:checkAllBees`);
        queen.checkAllBees();
    }

    if(Game.time % 1000 === 0){
        queen.junction(
            () => console.log(`${Game.time}|${queen.homeRoom}:Queen's nerual junction has been rebuilt!`)
        );
    }
}