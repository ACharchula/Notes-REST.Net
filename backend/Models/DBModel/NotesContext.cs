using Microsoft.EntityFrameworkCore;

namespace backend.Models.DBModel {

    public class NotesContext : DbContext {

        public DbSet<Note> Note {get; set;}
        public DbSet<Category> Category {get; set;}
        public DbSet<NoteCategory> NoteCategory {get; set;}

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        { 
            if (!optionsBuilder.IsConfigured) {
                optionsBuilder.UseSqlServer(@"Server=localhost,8200;Database=NTR2019Z;User Id=User2019Z;Password=Password2019Z;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.Entity<Note>(entity => {
                entity.HasKey(e => e.NoteID);
                entity.Property(e => e.NoteID).HasColumnName("IDNote");
                entity.Property(e => e.Date).HasColumnType("datetime").IsRequired();
                entity.Property(e => e.Description).HasMaxLength(1024).IsFixedLength();
                entity.Property(e => e.Timestamp).IsRowVersion().IsConcurrencyToken();
                entity.Property(e => e.Title).IsRequired().HasMaxLength(32);
            });

            modelBuilder.Entity<Category>(entity => {
                entity.HasKey(e => e.CategoryID);
                entity.Property(e => e.CategoryID).HasColumnName("IDCategory");
                entity.Property(e => e.Name).IsRequired().HasMaxLength(32);
            });

            modelBuilder.Entity<NoteCategory>(entity => {
                entity.HasKey(e => new { e.NoteID, e.CategoryID});
                entity.Property(e => e.CategoryID).HasColumnName("IDCategory");
                entity.Property(e => e.NoteID).HasColumnName("IDNote");
                
                entity.HasOne(e => e.Note)
                    .WithMany(e => e.NoteCategories)
                    .HasForeignKey(e => e.NoteID)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_NoteCategory_Note");

                entity.HasOne(e => e.Category)
                    .WithMany(e => e.NotesCategory)
                    .HasForeignKey(e => e.CategoryID)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_NoteCategory_Category");
            });
        }

    }

}