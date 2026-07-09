package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByCategoryName(String categoryName);
    boolean existsByCategoryName(String categoryName);
}