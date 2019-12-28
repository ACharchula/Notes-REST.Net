using System;
using System.Collections.Generic;

namespace backend.Models.DBModel {

    public class Note {

        public int NoteID {get; set;}
        public DateTime Date {get; set;}
        public string Title {get; set;}
        public string Description {get; set;}
        public short isMarkdown {get; set;}
        public byte[] Timestamp {get; set;}

        public IList<NoteCategory> NoteCategories {get; set;}
    }

}