import {getInstance as Model} from "./model.js";

let view;
class View {
    #DOM
    #currentNote

    constructor() {
        this.#DOM = {
            popupField : document.querySelector("#addNotes_popup_field"),
            openPopup : document.querySelector("#openPopup"),
            closePopup : document.querySelector("#closePopup"),
            addNote : document.querySelector("#addNote"),
            noteTitle : document.querySelector("#newNote_Title"),
            noteDate : document.querySelector("#newNote_Date"),
            noteText : document.querySelector("#newNote_Text"),
            priorityInputs: document.querySelectorAll('input[name="priority"]'),
            archiveNote : document.querySelector("#archiveNote"),
            sortNotes : document.querySelector("#sortNotes"),
            deleteNote : document.querySelector("#deleteNote"),
            editNote : document.querySelector("#editNote"),
            saveNoteChanges : document.querySelector("#saveNoteChanges"),
            reactivateNote : document.querySelector("#reactivateNote"),
            theme : document.querySelector('#themeToggle'),
            noteDetail : document.querySelector('#note_detail'),
            inputTags : document.querySelector("#newNote_Tags"),
            addTagBtn : document.querySelector("#addTagBtn"),
            tagField : document.querySelector("#tagField"),
            selectedTags : document.querySelector("#tagField p"),
            tagDiv : document.querySelector("#allTags"),
            /*allNotes : document.querySelectorAll('#notes_overview .all_notes'), return undefined --> getAllNotesFromDom*/
        }
    }

    getTagsFromDOM() {
        return document.querySelectorAll("#tagField p");
    }

    getAllNotesFromDom(){
        return document.querySelectorAll('#notes_overview .all_notes');
    }

    get DOM(){
        return this.#DOM;
    }
    get currentNote(){
        return this.#currentNote;
    }


    displayTagsPopup(tag){
        this.#DOM.tagField.innerHTML += `<p>${tag}</p>`;
    }

    resetPopup(){
        this.#DOM.tagField.innerHTML = ` `;
    }

    displayNote(note){
        let div = document.querySelector("#notesDiv")
        this.#printNote(note,div);
    }
    newArchiveNote(note){
        let div = document.querySelector("#archiveDiv")
        this.#printNote(note,div);
    }


    #printNote(note, div) {
        let noteDiv = document.querySelector("#N" + note.id);
        //console.log(note);
        if (noteDiv) {
            noteDiv.remove();
        }

        // Create HTML-String for tags
        let tagsHTML = '';
        note.tags.forEach((tag) => {
            tagsHTML += `<p class="tag rounded">${tag}</p>`;
        });

        // Insert HTML-String into tagDiv
        div.insertAdjacentHTML("afterbegin", `
        <li id="N${note.id}" class="all_notes ${note.priority}_priority">
            <div class="first_line">
                <h2>${note.title}</h2>
            </div>
            <div class="second_line">
                <p>${note.date}</p>
                <div class="tagDiv">
                    ${tagsHTML}
                </div>
            </div>
            <p class="third_line">${note.text}</p>
        </li>
    `);
    }

    displayDetailNote(noteElement){
        let id = noteElement.id.slice(1);
        if(Model().noteList.get(Number(id))){ //not archived
            this.#printDetailNote(noteElement, Model().noteList);
        }
        if(!Model().noteList.get(Number(id))){ //archived
            this.#printDetailNote(noteElement, Model().archivedList);
        }

    }


    #printDetailNote(noteElement, list){
        let id = noteElement.id.slice(1);
        let note = list.get(Number(id));
        //delete class focusedNote and add new one
        let noteElements = this.getAllNotesFromDom() ;
        //console.log(noteElements);
        noteElements.forEach((Element) => {
            Element.classList.remove("focusedNote");
        });
        noteElement.classList.add("focusedNote");

        //creates tagContainer and adds all Tags
        let tagsContainer = document.createElement('div');
        tagsContainer.classList.add('tagsContainer'); // Container for tags

        note.tags.forEach((tag) => {
            let tagDiv = createTagElement(tag); //function
            tagsContainer.appendChild(tagDiv);
        });

        //delete current detail Note and create new one
        let noteDetailChange = document.querySelector("#note_detail_change");
        noteDetailChange.innerHTML = '';
        noteDetailChange.insertAdjacentHTML("afterbegin", `
        <h1 id="noteTitle">${note.title}</h1>
        <p id="noteDate">${note.date} </p>
        <div id="notePriority"> ${note.priority} priority</div>
        <hr>
        <p id="noteText">${note.text}</p>
        `);

        noteDetailChange.appendChild(tagsContainer);
        //update currentNote
        this.#currentNote = noteElement;
    }



    deleteNote(note){
        note.remove();
        document.querySelector("#note_detail_change").innerHTML = '';
        document.querySelector("#note_detail_change").insertAdjacentHTML("afterbegin", `
        <h1 id="noteTitle">Please click on a note</h1>
        `);
        this.#currentNote = null;
    }


    editNoteContent(saveChanges){
        let note = this.currentNote;
        document.querySelector("#noteTitle").contentEditable = true;
        document.querySelector("#noteDate").contentEditable = true;
        document.querySelector("#noteText").contentEditable = true;

        saveChanges.classList.remove("d-none");
        saveChanges.addEventListener("click", ()=>{
            Model().editNote(saveChanges,note);
        });
    }




    displayTags() {
        let div = document.querySelector("#allTags");
        div.innerHTML = '';
        Model().tagList.forEach((tag) => {
            let tagDiv = document.createElement('div');
            tagDiv.classList.add('adjustTag');

            tagDiv.innerHTML = `
            <p>${tag}</p>
            <button id="delete${tag}" class="deleteTag btn btn-secondary">Delete</button>
            <button id="change${tag}" class="changeTag btn btn-secondary">Change</button>
            `;
            div.appendChild(tagDiv);

        });
    }

}
function createTagElement(tag) {
    let tagDiv = document.createElement('div');
    tagDiv.classList.add('tag', 'rounded');
    tagDiv.textContent = tag;
    return tagDiv;
}



export function getInstance() {
    if(!view) {
        view = new View();
    }
    return view;
}

