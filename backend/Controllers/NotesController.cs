using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using backend.Models;
using backend.Models.DBModel;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers {

    [ApiController]
    [EnableCors("Policy")]
    [Route("[controller]")]
    public class NotesController : ControllerBase {
        
        private const int PAGE_SIZE = 5;

        [HttpGet]
        [Route("all_notes")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult getAll(int page, string category, string from, string to) {
            using (var ctx = new NotesContext()) {
                var notes = ctx.Note.Include(i => i.NoteCategories)
                    .ThenInclude(i => i.Category)
                    .AsNoTracking().ToList();
                
                if (category != null && category != "All") {
                    page = 1;
                    notes = notes.Where(n => n.NoteCategories.Any(nc => nc.Category.Name.Equals(category))).ToList();
                }

                if (from != null && from != "null") {
                    page = 1;
                    notes = notes.Where(n => n.Date >= Convert.ToDateTime(from)).ToList();
                }

                if (to != null && to != "null") {
                    page = 1;
                    notes = notes.Where(n => n.Date <= Convert.ToDateTime(to)).ToList();
                }

                var categories = ctx.Category.Select(c => c.Name).ToList();
                var notesData = notes.Select(n => new NoteData(n)).ToList();
                var TotalPages = (int) Math.Ceiling(notesData.Count() / (double) PAGE_SIZE);  
                if (TotalPages < page) {
                    page--;
                }
                var pageOfNotes = notesData.Skip((page - 1) * PAGE_SIZE).Take(PAGE_SIZE).ToList(); 

                return Ok(new { data = new {notes = pageOfNotes, categories = categories, pager = new {currentPage = page, totalPages = TotalPages}}});
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult getById(int id) {
            using (var ctx = new NotesContext()) {
                var note = ctx.Note.Where(n => n.NoteID == id)
                .Include(n => n.NoteCategories)
                .ThenInclude(nc => nc.Category)
                .FirstOrDefault();

                if (note == null) {
                    return StatusCode(404, "Note has been deleted by another user");
                } else {
                    return Ok( new { note = new NoteData(note)});
                }
            }
        }

        [HttpPost]
        [Route("save_note")]
        [Consumes(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult create([FromBody] NoteData note) {
            using (var ctx = new NotesContext()) {
                if (ctx.Note.Any(n => n.Title == note.Title)) {
                    return StatusCode(400, "Note with title - " + note.Title + " - already exists");
                }
                Note dbNote = new Note() {Title = note.Title, Description = note.Description, Date = note.Date, isMarkdown = note.isMarkdown};
                dbNote.NoteCategories = preprareNoteCategory(ctx, note.Categories, dbNote);
                ctx.Note.Add(dbNote);

                try {
                    ctx.SaveChanges();
                } catch (DbUpdateException ex) {
                    return StatusCode(500, ex.InnerException.Message);
                }
            }

            return Ok();
        }

        private List<NoteCategory> preprareNoteCategory(NotesContext context, List<string> categories, Note note) {
            List<NoteCategory> noteCategories = new List<NoteCategory>();
            
            foreach (string category in categories) {
                var DBCategory = context.Category.Where(i => i.Name == category).FirstOrDefault();

                if (DBCategory == null) {
                    DBCategory = new Category {Name = category};
                    context.Category.Add(DBCategory);
                }

                noteCategories.Add(new NoteCategory {Note = note, Category = DBCategory});
            }        

            return noteCategories;
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult update(int id, [FromBody] NoteData note) {
            using (var ctx = new NotesContext()) {
                var original = ctx.Note.Where(n => n.NoteID == id)
                .Include(n => n.NoteCategories)
                .ThenInclude(nc => nc.Category)
                .FirstOrDefault();

                if (ctx.Note.Any(n => n.Title == note.Title && n.NoteID != id)) {
                    return StatusCode(400, "Note with title - " + note.Title + " - already exists");
                }

                if (original == null) {
                    return StatusCode(404, "Note has been deleted by another user");
                }

                ctx.Entry(original).Property("Timestamp").OriginalValue = note.Timestamp;

                original.Title = note.Title;
                original.Date = note.Date;
                original.Description = note.Description;
                original.isMarkdown = note.isMarkdown;

                original.NoteCategories = preprareNoteCategory(ctx, note.Categories, original);
                try {
                    ctx.SaveChanges();
                } catch (DbUpdateConcurrencyException ex) {
                    var exceptionEntry = ex.Entries.Single();
                    var databaseEntry = exceptionEntry.GetDatabaseValues();

                    if (databaseEntry == null) {
                        return StatusCode(404, "Note has been deleted by another user");
                    } else {
                        return StatusCode(403, "The record you attempted to edit "
                        + "was modified by another user after you got the original value. The "
                        + "edit operation was canceled and the current values in the database "
                        + "have been displayed. If you still want to edit this record, click "
                        + "the Save button again. Otherwise click the cancel button");
                    }
                } catch (DbUpdateException ex) {
                    return StatusCode(500, ex.InnerException.Message);
                }
                return Ok();
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult delete(int id) {
            using (var ctx = new NotesContext()) {
                var original = ctx.Note.Where(n => n.NoteID == id).Include(n => n.NoteCategories)
                    .FirstOrDefault();

                if (original == null) {
                    return Ok();
                }
                
                foreach(NoteCategory nc in original.NoteCategories) {
                    ctx.NoteCategory.Remove(nc);
                }

                ctx.Note.Remove(original);
                ctx.SaveChanges();
                return Ok();
            }
        }
    }
}