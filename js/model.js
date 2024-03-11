import {getInstance as View} from "./view.js";
import Subject from "./subject.js";
import Note from "./note.js";
import {getInstance as Controller} from "./controller.js";

let noteModel;

class NoteModel extends Subject{

    #noteList
    #archivedList
    #tagList
    constructor() {
        super();
        this.#noteList = new Map();
        this.#archivedList = new Map();
        this.#tagList = [];
        this.#loadFromJSON();

    }
    get noteList () {
        return this.#noteList;
    }
    get archivedList () {
        return this.#archivedList;
    }
    get tagList(){
        return this.#tagList;
    }

    handlePopup(popupField, displayValue) {
        popupField.style.display = displayValue;
        if (displayValue === "block") {
            this.notifyObservers("resetPopup");
        }
    }


    addNotePopup(title, date, text, priority){
        let note = new Note(title, date, priority, text, false);
        let tags = View().getTagsFromDOM();
        tags.forEach((tag) =>{
            note.addTags(tag.innerText); //adds tags to array of specific tag
            //console.log(tag.innerText);
        });

        this.addNote(note);
    }

    addNote(note){
        this.notifyObservers("createTagsOverview");
        if(note.archived){
            this.#archivedList.set(note.id,note)
            this.notifyObservers("addArchiveNote",note)
        }else{
            this.#noteList.set(note.id, note)
            this.notifyObservers("addNewNote",note)
        }
    }


    editNotes(saveNoteChanges){
        this.notifyObservers("editNote",saveNoteChanges)

    }
    editNote(saveChanges, note){
        let editedTitle = document.querySelector("#noteTitle").innerText;
        let editedDate = document.querySelector("#noteDate").innerText;
        let editedText = document.querySelector("#noteText").innerText;

        if (!isValidDateFormat(editedDate)) { //if editedDate is not valid date Format date is changed into 2024-01-01
            alert("ERROR: The date is not in the correct format or contains characters that are not numbers. \n" +
                "The date has been changed to 2024-01-01. ");
            editedDate = "2024-01-01";
        }

        let id = note.id.slice(1);
        if(this.#noteList.get(Number(id))){ //not archived Note
            this.#noteList.forEach((value) => {
                if (value.id == id) {
                    value.title = editedTitle;
                    value.date = editedDate;
                    value.text = editedText;
                    this.notifyObservers("addNewNote",value)
                }
            });
        }else{ //archived Note
            this.#archivedList.forEach((value) => {
                if (value.id == id) {
                    value.title = editedTitle;
                    value.date = editedDate;
                    value.text = editedText;
                    this.notifyObservers("addArchiveNote",value)

                }
            });
        }
        saveChanges.classList.add("d-none");
        Controller().addEventListener();

    }
    removeNote(note){
        //if ID contains N, delete N
        let id;
        if(isNaN(note.id)){
            id = note.id.slice(1);
        }else{
            id = note.id;
        }

        //delete from map
        //console.log(note);
        if(this.#noteList.get(Number(id))){ //not archived Note
            this.#noteList.forEach((value, key) => {
                if (value.id == id) {
                    this.#noteList.delete(key);
                }
            });
        }else{ //archived Note
            this.#archivedList.forEach((value, key) => {
                if (value.id == id) {
                    this.#archivedList.delete(key);
                }
            });
        }

        //delete from HTML
        this.notifyObservers("deleteNote",note);
    }

    archiveNote(note){
        let id = note.id.slice(1);
        //add Note to archived List
        this.#noteList.forEach((value) => {
            if (value.id == id) {
                value.archived = true; // marks note as archived
                this.#archivedList.set(Number(id), value);
                this.notifyObservers("addArchiveNote", value);
            }
        });

        this.removeNote(note);
    }
    activateNote(note){
        let id = note.id.slice(1);

        this.#archivedList.forEach((value) => {
            if (value.id == id) {
                this.removeNote(note); //removes note from noteList
                value.archived = false; // marks Note as not archived
                this.#noteList.set(Number(id), value);
                this.notifyObservers("addNewNote", value);
            }
        });
    }


    #loadFromJSON(){
        fetch("json/notes.json").then((response) => {
            return response.json();
        }).then(data =>{
            for(let note of data.notes){
                new Note(note); //to make sure ID is correct
                note.tags.forEach((tag)=>{
                    this.addTags(tag);
                });
                //add the tags
                this.addNote(note);
                Controller().addEventListener();
            }
        });
    }


    addTags(tag){ //adds Tags to Array tagList
        this.notifyObservers("displayTagsPopup",tag);
        if (!this.#tagList.includes(tag)) this.#tagList.push(tag); //check if not included in tagList
    }

    deleteTag(){
        this.notifyObservers("createTagsOverview");
    }


    changeTag(tag, oldName, newName) {
        //change view
        this.notifyObservers("createTagsOverview");

        // Change tag for all notes that include it
        this.#noteList.forEach((note) => {
            if (note.tags.includes(oldName)) {
                note.tags.forEach((tag, index) => {
                    if (tag === oldName) {
                        note.tags[index] = newName;
                    }
                });
                this.notifyObservers("addNewNote", note);
            }
        });


        this.#archivedList.forEach((note) => {
            if (note.tags.includes(oldName)) {
                note.tags.forEach((tag, index) => {
                    if (tag === oldName) {
                        note.tags[index] = newName;
                    }
                });
                this.notifyObservers("addArchiveNote", note);
            }
        });
        this.notifyObservers("createTagsOverview");
        //console.log(this.#tagList);
    }

}

function isValidDateFormat(dateString) {
    // try to parsen into date type
    let parsedDate = Date.parse(dateString);
    //can't be parsed into date or date is wrong format return false
    return !isNaN(parsedDate) && /\d{4}-\d{2}-\d{2}/.test(dateString);
}


//Singleton pattern
export function getInstance() {
    if(!noteModel) {
        noteModel = new NoteModel();
    }
    return noteModel;
}
