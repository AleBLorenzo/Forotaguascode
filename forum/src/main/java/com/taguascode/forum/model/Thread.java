package com.taguascode.forum.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="threads")
public class Thread {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)  
      private Long id;

      @Column(nullable= false , length= 100)
    private String title;

     @Column(nullable = false)
    private boolean pinned = false; 

     @Column(nullable = false)       // fijado arriba
    private boolean locked = false;        // cerrado a respuestas
    
    @Column(nullable = false)
    private int views = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

     @ManyToOne                          // muchos hilos pertenecen a un usuario
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne                          // muchos hilos pertenecen a una categoría
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL)   // un hilo tiene muchos posts
    private List<Post> posts;

    @ManyToMany                         // muchos hilos tienen muchas tags
    @JoinTable(
        name = "thread_tags",
        joinColumns = @JoinColumn(name = "thread_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tag> tags;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

}
