package QuanLy.Chat.Service.Impl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.UserRepository;
import QuanLy.Chat.Service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public User saveUser(User user) {
        // Basic validation: tránh username/email trùng (nếu repository có hỗ trợ)
        if (user.getUsername() != null && userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User user) {
        return userRepository.findById(id).map(existing -> {
            if (user.getUsername() != null) existing.setUsername(user.getUsername());
            if (user.getPasswordHash() != null) existing.setPasswordHash(user.getPasswordHash());
            if (user.getEmail() != null) existing.setEmail(user.getEmail());
            if (user.getPhoneNumber() != null) existing.setPhoneNumber(user.getPhoneNumber());
            if (user.getAvatarUrl() != null) existing.setAvatarUrl(user.getAvatarUrl());
            return userRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("User not found with id " + id));
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
