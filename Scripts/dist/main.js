require('config');
const Queen = require('class.queen');

const queen = new Queen(_PlayerName_, _HomeShard_, _HomeRoom_);

(function(){
    // 初始化整个系统
    // 为避免污染变量环境，包裹整个函数体

    // 清理残存的无效记忆
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    // 女王连接所有虫巢
    queen.junction();

}());


module.exports.loop = function () {

    let cpuUsed = Game.cpu.getUsed();

    if(cpuUsed > Game.cpu.limit){
        console.log(`${Game.time}: CPU run out of limit(${cpuUsed}/${Game.cpu.limit}), ` +
            `bucket remain ${Game.cpu.bucket}`);
    }

    timeSchedule();

    queen.doCommand();
};


function timeSchedule() {
    if(Game.time % 10 === 0){
        // console.log(`${Game.time}|log:checkAllBees`);
        queen.checkAllBees();
    }

    if(Game.time % 1000 === 1){
        queen.junction(
            () => console.log(`${Game.time}|${queen.homeRoom}:Queen's nerual junction has been rebuilt!`)
        );
    }
}