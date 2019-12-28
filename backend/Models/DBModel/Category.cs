using System.Collections.Generic;

namespace backend.Models.DBModel {

    public class Category {

        public int CategoryID {get; set;}
        public string Name {get; set;}

        public IList<NoteCategory> NotesCategory {get; set;}
    }

}