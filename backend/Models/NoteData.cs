using System;
using System.Collections.Generic;
using System.Linq;
using backend.Models.DBModel;

namespace backend.Models {
    public class NoteData {
        public int NoteID {get; set;}
        public DateTime Date {get; set;}
        public string Title {get; set;}
        public string Description {get; set;}
        public short isMarkdown {get; set;}
        public byte[] Timestamp {get; set;}

        public List<String> Categories {get; set;}

        public NoteData(Note note) {
            this.NoteID = note.NoteID;
            this.Date = note.Date;
            this.Title = note.Title;
            this.Description = note.Description;
            this.isMarkdown = note.isMarkdown;
            this.Timestamp = note.Timestamp;
            this.Categories = note.NoteCategories.Select(nc => nc.Category.Name).ToList();
        }

        public NoteData() {
        }
    }
}