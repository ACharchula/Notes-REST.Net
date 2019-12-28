using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.DBModel {

    public class NoteCategory {
        
        public int NoteID {get; set;}
        public Note Note {get; set;}
        
        public int CategoryID {get; set;}
        public Category Category {get; set;}
    }

}