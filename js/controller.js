import {getInstance as View} from "./view.js";
import {getInstance as Model} from "./model.js";

let controller;
class Controller {
    constructor() {
        let model = Model();
        let view = View();
        //register for own events
        model.subscribe("resetPopup",view,view.resetPopup);
        model.subscribe("addNewNote",view,view.displayNote);
        model.subscribe("displayDetailNote",view,view.displayDetailNote);
        model.subscribe("deleteNote",view,view.deleteNote);
        model.subscribe("addArchiveNote",view,view.newArchiveNote)
        model.subscribe("displayTagsPopup",view,view.displayTagsPopup);
        model.subscribe("editNote",view,view.editNoteContent);
        model.subscribe("createTagsOverview", view, function() {
            view.displayTags();
            controller.addEventListenerForTags();
        });
        this.#init();
    }

    #init(){
        let dom = View().DOM;
        //open and close Popup
        dom.openPopup.addEventListener("click", () => Model().handlePopup(dom.popupField, "block"));
        dom.closePopup.addEventListener("click", () => Model().handlePopup(dom.popupField, "none"));

        //dark mode toggle
        dom.theme.addEventListener('change', () => {dom.noteDetail.classList.toggle('dark')});

        //add tags
        dom.addTagBtn.addEventListener("click", (event) => {
            event.preventDefault();
            let input = dom.inputTags;
            let tag = input.value.replace(/[^\w\s]/gi, '').split(" ").join(""); //eliminates spaces & special characters
            if(tag){
                Model().addTags(tag,dom.tagField);
            }
            input.value = "";
        });

        //add new Note
        dom.addNote.addEventListener("click", ()=>{
            let title = dom.noteTitle.value;
            let date = dom.noteDate.value;
            let text = dom.noteText.value;

            let priorityInputs = Array.from(dom.priorityInputs); // converts NodeList into Array
            let priority = priorityInputs.find(input => input.checked)?.value; // selects selected value
            if(title && date && text && priority){
                Model().addNotePopup(title,date,text,priority);
                Model().handlePopup(dom.popupField, "none");
                this.addEventListener();
            }else{
                alert("Please enter title, date, text and priority!");
            }
        })

        //edit Note
        dom.editNote.addEventListener("click", ()=>{
            //console.log(dom.saveNoteChanges);
            if(!View().currentNote){
                alert("Please select note");
                return;
            }
            Model().editNotes(dom.saveNoteChanges);
        });

        //delete Note
        dom.deleteNote.addEventListener("click",()=>{
            //console.log(View().currentNote);
            if(View().currentNote){
                let confirmDelete = confirm("Do you really want to delete this note? Deleted notes can not be recovered! ")
                if(confirmDelete){
                    Model().removeNote(View().currentNote);
                }
            }else{
                alert("Please select note");
            }

        })

        //archive Note
        dom.archiveNote.addEventListener("click", ()=>{
           /* console.log(View().currentNote);*/
            let note = View().currentNote;
            if(note){
                let id = note.id.slice(1);
                if(Model().archivedList.get(Number(id))){ //is already archived
                    alert("ERROR: Note can't be archived because it already is!")
                    return;
                }
                Model().archiveNote(note);
                this.addEventListener();
            }else{
                alert("Please select note");
            }
        });

        dom.reactivateNote.addEventListener("click", ()=>{
            let note = View().currentNote;
            if(note){

                let id = note.id.slice(1);
                if(Model().noteList.get(Number(id))){ //is already activated
                    alert("ERROR: This note is not archived!")
                    return;
                }
                Model().activateNote(note);
                this.addEventListener();
            }else{
                alert("Please select note");
            }
        });


        //sort Notes
        dom.sortNotes.addEventListener("click", ()=>{
            //console.log(Model().noteList);
            Model().noteList.forEach((value) => {
                if (value.priority === "high") {
                    Model().addNote(value);
                }
            });
            Model().noteList.forEach((value) => {
                if (value.priority === "middle") {
                    Model().addNote(value);
                }
            });
            Model().noteList.forEach((value) => {
                if (value.priority === "low") {
                    Model().addNote(value);
                }
            });
            this.addEventListener();
        })


    }
    addEventListener() {
        let noteElements = View().getAllNotesFromDom();
        //console.log(noteElements);
        noteElements.forEach((noteElement) => {
            const clickHandler = function() {
                View().displayDetailNote(noteElement);
            }.bind(this);
            noteElement.removeEventListener("click", clickHandler);
            noteElement.addEventListener("click", clickHandler);
        });
    }


    addEventListenerForTags(){
        Model().tagList.forEach((tag) => {
            let deleteButton = document.querySelector(`#delete${tag}`);
            let changeButton = document.querySelector(`#change${tag}`);
            //console.log(deleteButton);
            deleteButton.addEventListener('click', () => {
                this.#deleteTag(tag);
                this.addEventListener();
            });

            changeButton.addEventListener('click', () => {
                this.#renameTag(tag);
                this.addEventListener();
            });
        });

    }

    #deleteTag(tag){
        let archivedList = Model().archivedList;
        let noteList = Model().noteList;
        let tagList = Model().tagList;
        let confirmDelete = confirm("Do you really want to delete this tag? Deleted tags can not be recovered! ")
        if (!confirmDelete) return;

        let existing = false;

        archivedList.forEach((note)=>{
            note.tags.forEach((existingTag)=>{
                if(tag == existingTag){
                    existing = true;
                }
            });
        });
        if(!existing){
            noteList.forEach((note)=>{
                note.tags.forEach((existingTag)=>{
                    if(tag == existingTag){
                        existing = true;
                    }
                });
            });
        }

        if(!existing){
            tagList.forEach((tagItem)=>{
                if(tag == tagItem){
                    tagList.splice(tagList.indexOf(tag), 1);
                    Model().deleteTag();
                }
            });
        }else{alert("Tag can not be delete because there still is a note with this tag!")}
    }

    #renameTag(tag){
        let tagList = Model().tagList;
        tagList.forEach((tagItem)=>{
            if(tag == tagItem){
                let oldName = tag;
                //console.log(oldName);
                let newName = prompt("Please enter new Tag name! Special characters and spaces are not allowed!");
                let newTagName = newName.replace(/[^\w\s]/gi, '').split(" ").join("");
                if(newTagName){
                    tagList[tagList.indexOf(tag)] = newTagName;
                }
               Model().changeTag(tag, oldName, newTagName);
            }
        });
    }

}

export function getInstance() {
    if(!controller) {
        controller = new Controller();
    }
    return controller;
}