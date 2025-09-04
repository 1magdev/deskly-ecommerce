package com.app.deskly.repository;

import com.app.deskly.model.User;
import java.util.ArrayList;
import java.util.List;
public class UserRepository {
    private List<User> users = new ArrayList<>();
    private long sequence = 1L;

    public User save (User user){
        if (user.getId() == null){
            user.setId(sequence++);
        }
        users.add(user);
        return user;
    }
    public User findByEmail(String email){
        for (User u : users){
            if (u.getEmail().equalsIgnoreCase(email)){
                return u;
            }
        }
        return null;
    }
    public User findByCpf(String cpf){
        for (User u : users){
            if (u.getCpf().equals(cpf)){
                return u;
            }
        }
        return null;
    }
    public List<User> findAll(){
        return users;
    }    
}
