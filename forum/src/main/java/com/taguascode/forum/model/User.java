package com.taguascode.forum.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//utilizamos lombok para la autogeneracion de los getters Setters . toString 
//Contructores ect automaticamente .

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")

public class User {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable= false ,length=100)
    private String username;
    
    @Email
    @Column(nullable= false , length=100 , unique= true)
    private String email;

    @Column(nullable= false , length=60)
    private String password;

    @Column(length=500 , nullable = true)
    private String avatarUrl;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.USER; 

    @Column(nullable = false)
    private boolean active  = true;

     @OneToMany(mappedBy = "author")   // un user tiene muchos hilos
    private List<Thread> threads;

    @OneToMany(mappedBy = "author")   // un user tiene muchos posts
    private List<Post> posts;


    @PrePersist
protected void onCreate() {
    this.createdAt = LocalDateTime.now();
}

}
