class AIInterface {
    constructor(){
        this.jobList = {
            None : undefined
        };


        this.AIName = "AIInterfece";
    }

    /**
     * Abstract
     * @param object
     */
    findJob(object){
        console.log('Abstract Method:findJob() in AIInterfece.class');
    }

    /**
     * Abstract
     * @param object
     */
    run(object){
        console.log('Abstract Method:run() in AIInterfece.class');
    }
}

module.exports = AIInterface;