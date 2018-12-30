require('config');
const Queen = require('class.queen');

const queen = new Queen(_PlayerName_, _HomeShard_, _HomeRoom_);

(function(){
    // 初始化整个系统
    // 为避免污染变量环境，包裹整个函数体
    for(let name in Memory.creeps) { // 清理残存的无效记忆
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    queen.junction(); // 女王连接所有虫巢
}());


module.exports.loop = function () {


    timeSchedule();

    queen.doCommand();
};


function timeSchedule() {
    if(Game.time % 10 === 0){
        // console.log(`${Game.time}|log:checkAllBees`);
        queen.checkAllBees();
    }

    if(Game.time % 1000 === 0){
        queen.junction(
            () => console.log(`${Game.time}|${queen.homeRoom}:Queen's nerual junction has been rebuilt!`)
        );
    }
}