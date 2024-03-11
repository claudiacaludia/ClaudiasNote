export default class Subject{
    constructor() {
        //Array
        this.observers = [];
    }

    subscribe(topic, listenerObj, callbackFct) {
        if (this.observers[topic] == undefined) {
            this.observers[topic] = new Array();
        }
        this.observers[topic].push({
            obj: listenerObj,
            fct: callbackFct,
        });

    }
    notifyObservers(topic, param) {
        let observersForTopic = this.observers[topic];
        if(observersForTopic) {
            for (let observer of observersForTopic) {
                observer.fct.call(observer.obj, param);
            }
        }else {
            throw "ERROR: Could not found desired topic " + topic;
        }
    }
}