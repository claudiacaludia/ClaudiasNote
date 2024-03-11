
export default class Note{
    #tags
    constructor(title, date, priority,text,archived) {
        this.id = ++Note.id;
        this.title = title;
        this.date = date;
        this.priority = priority;
        this.text = text;
        this.archived = archived; //true means archived - false means not archived
        this.#tags = [];
    }

    get tags(){
        return this.#tags;
    }

    addTags(tag){
        this.#tags.push(tag);
    }

}
Note.id = 0;



